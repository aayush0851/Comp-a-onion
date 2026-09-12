# Free-Tier Launch Plan

Executes [backend-system-design.md](./backend-system-design.md)'s **Approach A**
(cost-efficient) with every piece pinned to a genuinely free tier — $0/month until
real usage forces an upgrade. Schema is [BE-er-todo.md](./BE-er-todo.md), unchanged.

## Stack — what, where, why

| Layer | Choice | Free tier limit | Why this one |
|---|---|---|---|
| Compute (API) | **Google Cloud Run** | 2M requests/mo, 360k GiB-sec, 180k vCPU-sec — "Always Free," not a trial | Scales to zero (true $0 when idle), no cold-start penalty as harsh as some alternatives, runs the NestJS container as-is |
| Compute (alt., no card required) | Render free Web Service | 750 hrs/mo, sleeps after 15 min idle | Zero setup friction, no billing account at all — pick this over Cloud Run if you'd rather not link a card, accept ~30s cold start on first request after idle |
| Database | **Neon** (managed Postgres) | 0.5 GB storage, autosuspend compute | Real Postgres (Prisma works unmodified), branching per PR/preview at no cost, autosuspend matches Cloud Run's scale-to-zero |
| Object storage (selfies, photos, highlights) | **Cloudflare R2** | 10 GB storage, **zero egress fee** | Free tiers elsewhere charge for egress once traffic grows; R2 doesn't — avoids a bill later even if storage itself would still be free |
| Realtime (chat/notifications) | SSE endpoints inside the same Cloud Run/Render container, backed by Postgres `LISTEN/NOTIFY` | included in compute | No broker, no separate service — per [backend-system-design.md](./backend-system-design.md#realtime--push-delivery) |
| Push notifications | **Expo Push** → APNs/FCM | free, no quota for reasonable volume | Already the natural choice for an Expo app; no separate vendor |
| Background jobs (join-request expiry, token cleanup) | **GitHub Actions scheduled workflow** hitting a protected cron endpoint | 2,000 min/mo private repo (unlimited public) | No cron infra needed on the compute side at all |
| CI/CD | **GitHub Actions** | 2,000 min/mo private | Same account as the repo, no new signup |
| Error monitoring | **Sentry** free tier | 5k errors/mo | Catches prod crashes without grepping Cloud Run logs |
| Domain | Platform-provided subdomain (`*.run.app` / `*.onrender.com`) | free | Defer buying a real domain (~$10-15/yr) until there's a reason to — first real non-free line item, not day one |
| OTP/SMS | **Deferred — see below** | n/a | The one piece that resists staying free forever |

### The OTP problem

Every real SMS OTP provider (Twilio, MessageBird, etc.) charges per message — there
is no sustainable $0 option once you're sending real texts to real phones. Two
ways to stay free through early development:

1. **Mock verification in dev/staging** — `VerificationCheck` rows get
   auto-approved for a fixed allowlist of test numbers (already how `VERIFY_STEPS`
   behaves today — no real send/verify call exists in the client). Ship the whole
   rest of the stack against this before OTP is real.
2. **Firebase Phone Auth's free quota** at actual launch — a free tier exists for
   phone verification specifically (separate from Firebase's other paid pieces),
   or accept Twilio's pay-as-you-go cost as the single paid line item once there
   are real users signing up. Don't try to route around this with a hack; it's a
   trust/safety-critical path (see [er-diagram.md](./er-diagram.md)'s
   `VerificationCheck` entity) where cutting corners is the wrong kind of lazy.

## Step-by-step

1. **Accounts** — GitHub (already have), Neon, Cloudflare (R2), Google Cloud (Cloud
   Run) or Render, Expo (already have via the mobile app), Sentry. All free signups,
   no card needed except Cloud Run if you pick it over Render.
2. **Scaffold `apps/server`** — NestJS project, Prisma schema copied in from
   [BE-er-todo.md](./BE-er-todo.md), `prisma migrate dev` against a local Postgres
   (Docker) for iteration speed; point `DATABASE_URL` at Neon only for
   staging/deploys.
3. **Seed script** — port `data/activities.ts`, `data/people.ts`, `data/reviews.ts`,
   `data/chat.ts` into `User`/`Event`/`JoinRequest`/`ChatMessage` rows (per
   BE-er-todo's migration path) so local dev has the same fixtures the mobile app
   already ships with.
4. **Core CRUD + capacity-check transaction** — Event, JoinRequest (with the
   `SELECT ... FOR UPDATE` approval transaction), Review, PersonReview. Get this
   working end-to-end against local Postgres before touching deploy.
5. **Auth** — phone-based session (JWT), gated behind the mocked
   `VerificationCheck` flow from the OTP section above. Real SMS is explicitly
   out of scope for this phase.
6. **Wire the mobile app's `store/*Store` reducers to real API calls** — one
   slice at a time (`plansStore` → `authStore` → `chatStore` → `reviewStore`),
   keeping the existing optimistic local state and reconciling with the server
   response, per BE-er-todo's migration-path note. Do this against local Postgres
   first, deploy comes after.
7. **First deploy** — Dockerfile for the NestJS app, GitHub Actions workflow that
   builds + pushes to Cloud Run (or Render's git-based auto-deploy, which needs no
   Actions workflow at all — simpler if you picked Render). Point `DATABASE_URL` at
   Neon. Confirm scale-to-zero actually happens (check Cloud Run/Render dashboard
   after idle).
8. **R2 for media** — signed upload URLs for profile photos/highlights/selfies,
   client uploads directly to R2 (never proxied through the API), matching
   Approach A's design.
9. **Realtime** — SSE endpoint(s) per [backend-system-design.md](./backend-system-design.md#realtime--push-delivery),
   backed by `LISTEN/NOTIFY` on `ChatMessage` insert. Verify a message sent from
   one device shows up live on another without a manual refresh.
10. **Push** — `DeviceToken` registration on app open, Expo Push call from the
    chat-insert/join-request/approval code paths when no live SSE connection is
    found for the recipient.
11. **Rate limiting** — `@nestjs/throttler` with its default in-memory store
    (correct for Approach A, per [backend-system-design.md](./backend-system-design.md#rate-limiting)),
    tightened limits on OTP-send, join-request creation, chat send, review/report
    submission.
12. **Cron** — GitHub Actions scheduled workflow calling a protected
    `/internal/expire-join-requests` endpoint (and similar cleanup jobs) on a
    schedule; no in-app scheduler needed.
13. **Sentry** — wire up error reporting in the NestJS app before any real users
    touch it, not after the first crash report comes in secondhand.
14. **Soft launch** — real users, real numbers, still on mocked OTP if SMS isn't
    solved yet, monitoring Neon storage/compute and Cloud Run/Render request count
    against their free-tier ceilings.
15. **Watch the upgrade signals** — the moment any free-tier ceiling is actually
    approached (Neon storage, R2 storage, Cloud Run request volume, Sentry event
    quota), that's the trigger to pay for *that one piece*, not to re-architect —
    revisit [backend-system-design.md](./backend-system-design.md#choosing-between-them)
    only when Approach A's actual signals (concurrent users, write contention,
    realtime connection count) are hit, which is a much later and different
    threshold than any individual free-tier cap.

## What's explicitly out of scope for this phase

- Real SMS OTP (see above).
- A custom domain.
- Multi-region anything.
- Approach B's broker/worker fleet/Redis — not needed until the signals in
  backend-system-design.md's comparison table actually show up.
