# Selfie & Identity Verification Plan

Standalone plan for the `Verify`/`SelfieCheck` flow — split out of
[free-tier-launch-plan.md](./free-tier-launch-plan.md) because it has its own open
questions (does govt ID belong in this app at all, how do we stop the 3-pose check
from being trivially gamed) that deserve a decision before schema/build work starts.

## Current state

`VERIFY_STEPS` in `data/constants.ts` today only has two steps: `phone` and
`selfie`. There is **no govt ID step in the current app** — the earlier version of
this plan's ER diagram assumed one (`VerificationCheck.type: 'id' | 'selfie'`), but
that's stale against the actual client, which was simplified down to phone +
selfie only. `SelfieCheck.tsx` itself is fully mocked: no camera, no upload, no
comparison — three `setTimeout`s and a "queued" state.

## Question 1 — should we accept a govt ID too?

Two different things get conflated under "verification," and the answer depends on
which one this app actually needs:

- **Liveness only** ("is this a real, unique human, not a bot/stolen photo?") — the
  3-pose selfie already does this on its own. No ID needed.
- **Identity match** ("is this person who they claim to be — does the selfie match
  a real, government-issued document?") — this is what govt ID buys you, and *only*
  in combination with a selfie face-match against the ID photo. An ID photo alone,
  unmatched, verifies nothing (anyone can photograph anyone's ID).

**Why it matters here specifically**: this app puts strangers in the same physical
room (`Detail`/`Chat`/meetup flow) — that's a real-world safety surface, not just
an anti-spam one. That pushes toward wanting identity match, not just liveness.
Against that: govt ID capture pulls in KYC-grade compliance obligations (PII
storage/retention rules, potentially region-specific ID-handling law) that a
free-tier, pre-launch app should not take on lightly, and the current app doesn't
even collect it today.

**Recommendation**: phase it, don't decide it as all-or-nothing up front.

| Phase | What | Why |
|---|---|---|
| 1 (now) | Selfie liveness only, manual review | Matches the app as it exists today; $0 cost; proves "real human," which is enough to stop the obvious bot/catfish-with-a-stolen-photo cases |
| 2 (if/when warranted) | Add govt ID + face-match, via a **vetted KYC vendor** (Persona, Onfido, Veriff — not a homegrown OCR/face-match pipeline) | Offloads the compliance burden (ID storage, redaction, retention law) to a vendor whose entire business is being audited for exactly that; homegrown ID handling is the wrong place to be lazy |

The trigger for Phase 2 is a product/legal decision (e.g. a safety incident, a
region requiring KYC, or paid/higher-trust tiers), not a technical one — flag it,
don't build it speculatively.

## Question 2 — how do we stop the 3 poses being the same photo submitted 3x?

Layered checks, cheapest first — stop as early as possible, only add the next
layer if the previous one isn't enough:

1. **Camera-only capture, no gallery picker.** `expo-camera` live capture for all
   three shots; the picker used for `ProfilePhoto`/`Highlights` is explicitly not
   available on this screen. Removes the trivial "pick the same file 3 times" path
   entirely — costs nothing, blocks the laziest cheat outright.
2. **On-device pose gating before the shutter fires.** Real-time face-landmark
   detection (`expo-face-detector` / ML Kit, on-device, free) reads head yaw and
   only enables capture once the live feed matches the prompted pose (front / left
   / right) within a threshold. This is what makes the 3 poses *meaningfully*
   different at capture time, not just labeled differently.
3. **Server-side duplicate check on upload, as a backstop.** #2 runs on a device
   you don't control — a modified/rooted client could skip it and upload three
   identical frames anyway. On upload, run a cheap perceptual hash (`pHash`) or
   pixel-diff on the three images; if any two are near-identical, auto-reject
   before the images ever reach a human reviewer. This is pure computation (a
   small library, no external API), so it stays free.
4. **Human review catches what automation misses.** Given Phase 1 is a manual
   review queue anyway (see the parent plan), the reviewer visually confirms the
   three poses actually differ as a final check — free, and the fallback for
   anything #2/#3 didn't catch.

Deliberately **not** doing at Phase 1: cross-pose face-embedding match (confirming
all 3 photos are the same person, at genuinely different angles) — that needs an ML
model/vendor call, which is the first thing to add if manual review volume becomes
the bottleneck, not before.

## Schema changes needed

`VerificationCheck` (in [BE-er-todo.md](./BE-er-todo.md)) currently has no field to
hold the actual uploaded images — it's just `type`/`status`/timestamps. Add:

```prisma
model VerificationCheck {
  id           String              @id @default(uuid())
  userId       String
  user         User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  type         VerificationType
  status       VerificationStatus  @default(PENDING)
  photoUrls    String[]            // R2 object keys — 3 selfie poses (type=SELFIE); empty until Phase 2 adds ID
  rejectReason String?             // set by reviewer on REJECTED, shown back to the user
  submittedAt  DateTime            @default(now())
  reviewedAt   DateTime?
  reviewedBy   String?             // admin/reviewer id — not a User FK, a separate admin identity

  @@index([userId, type])
}
```

`VerificationType` gains `ID` only when Phase 2 actually starts (`PHONE | SELFIE |
ID`) — don't add it speculatively now, per the phasing above.

## Review queue (Phase 1, manual)

No new entity needed — it's a query, not a table: `VerificationCheck` rows with
`status = PENDING` and `type = SELFIE`, each showing its `photoUrls`. A minimal
internal-only screen (could be a bare authenticated web page, not part of the
mobile app) lets a reviewer approve/reject; on decision, flip `status`,
set `reviewedAt`/`reviewedBy`, and fire a `Notification` (`APPROVAL`-shaped) to the
user either way.

## Open items to revisit later

- Where does the review queue actually live — a tiny internal NestJS-served admin
  page, or a no-code tool (Retool/Airtable) pointed at the same Postgres? Free
  either way at this volume; pick based on who's doing the reviewing.
- Retention: how long do rejected/approved selfie photos stay in R2? Not a Phase-1
  blocker, but decide before real user photos accumulate, not after.
