# Companion App — Workflow

Companion helps people fit into a new place: find what's happening nearby, join or host something, and chat with the group before/after.

## Flow

```
Signup ──> Verify ──> Lock ──> Board (home feed)
 (OTP)     (govtId +  (pending   │
            selfie)    approval) │
                                  ├──> Detail ──> Sent ─────────────┐
                                  │   (join an                      │
                                  │    event)                       │
                                  │                                 ▼
                                  ├──> Create ──> Sent ──> Queue ──> Chat ──> Review ──> Filed
                                  │   (host a           (host approves  (group    (rate the   (review
                                  │    new event)         joiners)       chat)      meetup)     submitted)
                                  │
                                  └──> Profile (history/stats, reachable any time from Board)
```

## Screens

| Screen | File | Purpose | State touched | Next |
|---|---|---|---|---|
| Signup | [src/screens/Signup.tsx](../src/screens/Signup.tsx) | OTP-based signup entry | — (UI only, no real OTP send yet) | Verify |
| Verify | [src/screens/Verify.tsx](../src/screens/Verify.tsx) | Govt ID + selfie verification steps, driven by `VERIFY_STEPS` in [src/data.ts](../src/data.ts) | — (UI only, no real ID/selfie capture yet) | Lock |
| Lock | [src/screens/Lock.tsx](../src/screens/Lock.tsx) | "Verification pending" gate until approved | — | Board |
| Board | [src/screens/Board.tsx](../src/screens/Board.tsx) | Home feed of nearby activities/events, filterable via `FILTER_LABELS`/`TABS` | reads `activities` seed data | Detail, Create, Profile |
| Detail | [src/screens/Detail.tsx](../src/screens/Detail.tsx) | View one event, request to join | writes a join request | Sent |
| Create | [src/screens/Create.tsx](../src/screens/Create.tsx) | Multi-step: title/tags → time/venue → group shape/join settings | writes create-flow draft | Sent |
| Sent | [src/screens/Sent.tsx](../src/screens/Sent.tsx) | Confirmation after joining or creating | — | Queue (host) / Board |
| Queue | [src/screens/Queue.tsx](../src/screens/Queue.tsx) | Host approves/declines join requests | writes queue decisions | Chat |
| Chat | [src/screens/Chat.tsx](../src/screens/Chat.tsx) | Event group chat + venue voting | writes chat messages, venue votes | Review |
| Review | [src/screens/Review.tsx](../src/screens/Review.tsx) | Post-event: rate setup, tag people, meet-again/flag | writes review scores | Filed |
| Filed | [src/screens/Filed.tsx](../src/screens/Filed.tsx) | Review submitted confirmation | — | Board |
| Profile | [src/screens/Profile.tsx](../src/screens/Profile.tsx) | User profile, history, stats | reads profile stats | Board |

Route names/params are defined in [src/navigation.ts](../src/navigation.ts); the stack starts at `Signup` ([App.tsx](../App.tsx)).

## State model

All app state lives in one `AppProvider` (React Context + `useReducer`) — [src/state.tsx](../src/state.tsx). Slices:

- **Join requests** — a user's pending/approved requests to join events.
- **Create-flow draft** — in-progress event being built in `Create`.
- **Host queue decisions** — approve/decline outcomes for join requests, per event.
- **Chat** — messages and venue votes, per event.
- **Review scores** — post-event ratings, people tags, meet-again/flag.

Static seed/mock data and shared types (`Activity`, `ChatMessage`, `QueueRequest`, ...) live in [src/data.ts](../src/data.ts). Shared UI primitives are in [src/components/ui.tsx](../src/components/ui.tsx); design tokens in [src/theme.ts](../src/theme.ts).

## Known gaps (not yet implemented)

- **OTP** — Signup screen has no real send/verify call.
- **Govt ID + selfie verification** — Verify screen has no camera/ID-scan SDK; steps are mock data.
- **Backend** — no Supabase/Firebase/custom API anywhere; all data is local mock state, nothing persists across app restarts.
