# Backend System Design — Distributed Architecture

Two approaches for standing up `apps/server` against the schema in
[BE-er-todo.md](./BE-er-todo.md), both distributed (not a single monolith on one
box), optimized for different constraints. Pick one — don't build both.

## Shared assumptions

- Workload is read-heavy (Board feed, chat scrollback, profile/reviews) with bursty
  write spikes (join-request approve/decline during "prime time" evening hours, chat
  during an active event).
- Two things need strict consistency: **join-request capacity** (can't approve past
  `seatsTotal` — race between two approvals) and **review submission** (one row per
  reviewer per event). Everything else (notifications, chat, profile reads) can be
  eventually consistent.
- Real-time requirement: chat and "someone joined/approved" notifications should
  feel live, not poll-every-30s.

## Realtime & push delivery

Two separate delivery paths per message/event, chosen at send time based on
whether the recipient is actively connected:

```
ChatMessage / Notification write
            │
            ▼
   is recipient's realtime
   connection (SSE/WS) live?
      │                │
     yes                no
      │                │
      ▼                ▼
push down the      look up their DeviceToken
open connection    rows → Expo Push → APNs/FCM
(in-app render,    (OS-level push,
no OS involvement)  app backgrounded/killed)
```

- **Foreground (app open, connection live)**: the transport delivers the row
  directly — the client is already streaming updates for chats/events it cares
  about, so this is just "render it" (in the open chat) or "show an in-app
  banner/badge" (elsewhere in the app). No OS notification, no APNs/FCM call — the
  app decides whether to vibrate/sound itself.
- **Background/killed (no live connection)**: there is nothing to push to, so the
  service looks up the recipient's `DeviceToken` rows (see
  [BE-er-todo.md](./BE-er-todo.md)) and calls a push service (Expo Push, which
  relays to APNs/FCM) with a title/body. This is what actually buzzes the phone —
  it's a distinct code path from the chat/notification transport, not something the
  transport does automatically.
- **Dedupe rule**: never do both for the same event. If the recipient has a live
  connection, push over it only; only fall back to APNs/FCM if no connection is
  found (or after a short grace period with no ack, to cover a connection that's
  dying but not yet detected as closed).
- **Transport choice for the "live connection" leg**: Server-Sent Events is a
  simpler fit than a full WebSocket gateway for this app's traffic shape — chat
  send is a normal `POST /events/:id/messages` (insert a `ChatMessage`, which
  triggers `LISTEN/NOTIFY` in Approach A or a broker publish in Approach B); receive
  is `GET /events/:id/messages/stream` (`text/event-stream`), which is one-directional,
  auto-reconnects via `EventSource` with no custom protocol, and passes through
  ordinary HTTP proxies/CDNs cleanly. The tradeoff: SSE is one connection per stream
  being watched, so a user's notifications feed and each open chat either share one
  multiplexed per-user stream, or fall back to a socket only for that combined
  fan-out case. Approach A's diagram below still shows a WS gateway as the
  general-purpose option; swap it for per-endpoint SSE streams if chat is the
  dominant realtime use case (it is, here).
- **Where this lives in the schema**: `Notification` rows are the in-app inbox
  history and are written regardless of delivery outcome; they are not a
  precondition for push (see BE-er-todo.md's "Chat unread + push" note) — a chat
  message can trigger a push without ever creating a `Notification` row.

## Rate limiting

Applies to both approaches — where the limiter's state lives is the only thing
that differs. Endpoints that need a stricter-than-default limit, and why:

| Endpoint | Limit | Why |
|---|---|---|
| OTP send (`Signup`) | e.g. 3/phone/hour, 1/phone/min | costs real money per SMS and is the #1 abuse target (spam-bombing a number, or enumerating phones) |
| `POST /join-requests` | e.g. 20/user/hour | stops one user from spamming every open event |
| `POST /events/:id/messages` (chat) | e.g. 1/sec sustained, burst ~10 | prevents one user flooding an event chat and drowning out others |
| `POST /reviews`, `POST /review-reports` | e.g. 10/user/hour | review/report spam is a trust-and-safety vector, not just a load one |
| Everything else (reads, `Board` feed, etc.) | a generous default (e.g. 100/user/min) | baseline abuse/bug protection, not expected to bind in normal use |

General default limit is per-authenticated-user; fall back to per-IP only for
pre-auth endpoints (OTP send, before a session exists).

- **Approach A**: in-process limiter (`@nestjs/throttler` with its default
  in-memory store) is correct here — there's exactly one API instance, so
  in-memory counters can't be bypassed by hitting a different replica. Zero extra
  infra, resets on redeploy (acceptable at this scale).
- **Approach B**: in-memory counters break the moment there's more than one API
  replica (a client just gets N× the limit by landing on different instances) —
  limiter state must move to Redis (already present in Approach B for
  caching/sessions), using a sliding-window or token-bucket algorithm shared across
  all replicas. `@nestjs/throttler`'s Redis storage adapter, or a small custom
  Lua-script-based limiter, both work.
- **Push delivery is self-limiting**: Expo Push enforces its own rate limits on the
  sending side — the worker fleet (Approach B) or API process (Approach A) should
  respect Expo's documented receipt/retry behavior rather than adding a second
  layer of throttling on top for that specific call.

## Approach A — Cost-efficient (early stage, low/unpredictable traffic)

Goal: lowest fixed monthly bill, scale-to-zero where possible, minimum number of
moving pieces to operate. "Distributed" here means *services separated by
responsibility*, not necessarily *many machines* — most of the distribution comes
from using managed multi-tenant infra instead of dedicated fleets.

```
┌─────────────┐      ┌───────────────────────────┐      ┌──────────────┐
│  Mobile app │─────▶│  NestJS API (single        │─────▶│  Postgres    │
│  (Expo)     │      │  container, autoscale      │      │  (managed,   │
└─────────────┘      │  0→N on Fly.io/Railway)    │      │  Neon/Supabase│
        │             └───────────┬───────────────┘      │  free/low tier)│
        │                         │                        └──────────────┘
        │             ┌───────────▼───────────────┐
        └────────────▶│  Realtime: Postgres LISTEN/│
     (WS via API)      │  NOTIFY → API WS gateway   │
                       └────────────────────────────┘
```

- **Compute**: one NestJS service, containerized, deployed to a platform that
  scales to zero on idle (Fly.io, Railway, Render free/hobby tier). No separate
  microservices — capacity checks, notifications, chat all live in one codebase as
  distinct modules, so there's one deploy, one log stream, one thing to debug.
- **Database**: managed Postgres with a generous free tier (Neon or Supabase-as-DB-only,
  per [backend-strategy.md](./backend-strategy.md)'s middle-ground recommendation).
  Branching (Neon) is useful for preview environments at no extra infra.
- **Realtime**: skip a dedicated message broker. Use Postgres `LISTEN/NOTIFY`
  (trigger on `ChatMessage`/`Notification` insert) fanned out to connected clients
  over a WebSocket gateway inside the same NestJS process. Handles hundreds of
  concurrent connections fine; no Redis/Kafka bill.
- **Capacity check race**: a single `SELECT ... FOR UPDATE` inside a Postgres
  transaction on the `Event` row when approving a `JoinRequest` — correct because
  there's only one API process talking to one Postgres primary; no distributed lock
  needed at this scale.
- **File storage** (selfies, profile photos, highlights): object storage with a free
  tier (Supabase Storage or Cloudflare R2 — no egress fee on R2), not a self-hosted
  bucket.
- **Background jobs** (join-request expiry, notification cleanup): a cron endpoint
  hit by the platform's built-in scheduler (Fly Machines cron / Railway cron), not a
  separate queue worker.
- **Push delivery**: a direct call to Expo Push from the same API process at the
  point of insert (see "Realtime & push delivery" above) — no separate push service
  needed at this scale.
- **Cost shape**: near-$0 while idle, scales linearly and cheaply with usage; the
  ceiling is "when one Postgres primary and one API instance can't keep up" —
  explicitly deferred to Approach B.

**When to leave this**: sustained concurrent WebSocket connections in the
thousands, write contention on the `Event` row lock becoming visible as latency, or
needing multi-region latency — that's the signal to move to B, not before.

## Approach B — Scalable (growth stage, high/spiky traffic, multi-region)

Goal: horizontal scale on every tier independently, no single point of contention,
tolerant of a region going down.

```
                        ┌─────────────┐
                        │   CDN/Edge   │  (static assets, images)
                        └──────┬───────┘
                               │
                  ┌────────────▼────────────┐
                  │   API Gateway / LB       │
                  └───┬───────────┬──────────┘
        ┌─────────────▼──┐   ┌────▼─────────────┐
        │ REST/RPC API    │   │ WebSocket/Realtime│
        │ (stateless,     │   │ gateway (stateless,│
        │  N replicas)    │   │  N replicas)       │
        └───┬─────────┬───┘   └─────────┬──────────┘
            │         │                  │
  ┌─────────▼──┐  ┌───▼────────┐   ┌─────▼──────────┐
  │ Postgres    │  │ Redis      │   │ Message broker  │
  │ primary +   │  │ (cache,    │   │ (Kafka/SQS/     │
  │ read replicas│  │  session,  │   │  Redis Streams) │
  │ (per region) │  │  rate-limit)│   │ — chat, notifs, │
  └─────────────┘  └────────────┘   │  review fan-out │
                                     └────────┬────────┘
                                     ┌─────────▼────────┐
                                     │ Worker fleet      │
                                     │ (expiry, notif    │
                                     │  fan-out, digests)│
                                     └───────────────────┘
```

- **API tier**: stateless NestJS replicas behind a load balancer, autoscaled on
  CPU/request rate. Any replica can serve any request — no sticky sessions except
  the WebSocket gateway (see below).
- **Realtime tier**: separated from the request/response API into its own
  stateless service, scaled independently (chat/notification connection count
  scales differently from API request rate). Backed by a message broker (Redis
  Streams for simplicity, Kafka if event volume/replay needs grow) so any gateway
  replica can publish/consume — no in-process pub/sub tying clients to one instance.
- **Database**: Postgres primary for writes, read replicas (per region if
  multi-region) for the read-heavy Board feed, profile, and chat scrollback
  queries. Add Redis in front of hot reads (event feed by geo bucket, unread
  notification counts) to take load off the primary.
- **Capacity check race**: `SELECT ... FOR UPDATE` no longer suffices once there are
  multiple API replicas and possibly multiple DB writers — use a per-event
  distributed lock (Redis `SET NX PX` or Postgres advisory lock keyed by `eventId`)
  around the approve transaction, or push the increment through a single-writer
  queue consumer per event to serialize it.
- **Async work**: join-request expiry, notification fan-out, review-unlock digests
  move to a worker fleet consuming from the broker — decouples "an event happened"
  from "everyone who cares is notified," and lets that fan-out scale independently
  of the API.
- **Geo queries**: PostGIS with a GiST index once event density makes a bounding-box
  filter meaningful, sharded/partitioned by region if the user base is
  geographically distributed.
- **Media**: CDN-fronted object storage, uploaded via signed URLs directly from the
  client (skip proxying binary uploads through the API tier).
- **Push delivery**: the worker fleet owns Expo Push/APNs/FCM calls, consuming a
  "no live connection" fan-out event from the broker — decouples push-service rate
  limits/retries from the request path entirely.
- **Cost shape**: higher fixed floor (multiple always-on tiers: API, realtime,
  broker, workers, cache, DB replicas) — justified once traffic/reliability needs
  actually require independent scaling of each tier, not before.

## Choosing between them

| Signal | Stay on A | Move to B |
|---|---|---|
| Concurrent users | low hundreds | thousands+ |
| Write contention on `Event.seatsTotal` | rare, single-region | frequent, or multi-region writers |
| Realtime connections | low hundreds | thousands+, or multi-region |
| Team ops capacity | small/no dedicated infra person | can own a broker + worker fleet |
| Budget priority | minimize fixed cost | pay for headroom/reliability |

Start on A. The schema in [BE-er-todo.md](./BE-er-todo.md) doesn't change between
them — only how it's deployed and fronted — so migrating later is an infrastructure
change, not a data-model rewrite.
