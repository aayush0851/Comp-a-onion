# BE-ER-TODO — Backend ER Schema Draft

Turns [er-diagram.md](./er-diagram.md) into an implementable schema for
`apps/server` (NestJS + Postgres, per [backend-strategy.md](./backend-strategy.md)).
Written as Prisma models since Prisma gives migrations + a typed client for free —
swap to raw SQL/TypeORM 1:1 if that decision changes.

## Conventions

- All PKs: `uuid` (`@default(uuid())`).
- All FKs: `onDelete: Cascade` from the child side unless noted (a deleted Event
  should not leave orphan JoinRequests/ChatMessages/Reviews behind).
- All tables: `createdAt DateTime @default(now())`; add `updatedAt` only where a row
  is mutated post-creation (User, Event, JoinRequest, VerificationCheck).
- Enums as Postgres enums, not free-text columns, for every closed vocabulary
  (`entryMode`, `genderRestriction`, `costMode`, statuses).
- No stored derived columns (`seatsFilled`, `joinedCount`, `isArchived`-from-date) —
  compute in a service method or a Postgres view. `isArchived` on Event IS a real
  column (host can archive manually); the *display* "archived" state in the client
  (`isPlanArchived`) additionally ORs in a past-date check — keep that OR in the
  query layer, not the column.
- **Exception**: `User.aggregatedRating` and `User.isMalice` ARE stored derived
  values — deliberately denormalized so every Board/Profile/Queue read that shows a
  user's rating or trust status doesn't join and aggregate `PersonReview` on every
  request. Both are written by the service layer at the point a `PersonReview` is
  created/flagged/reported (recompute-on-write), not read live.

## Schema

```prisma
enum EntryMode {
  OPEN
  APPROVE
}

enum GenderRestriction {
  ANYONE
  WOMEN
  MEN
}

enum CostMode {
  HOST
  DUTCH
}

enum JoinRequestStatus {
  PENDING
  APPROVED
  DECLINED
  EXPIRED
}

enum VerificationType {
  PHONE
  SELFIE
}

enum VerificationStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ReportStatus {
  OPEN
  RESOLVED
}

enum NotificationKind {
  JOIN_REQUEST
  APPROVAL
  REVIEW_UNLOCKED
  RATING_RECEIVED
  // No MESSAGE_RECEIVED: unread chat state is client-determined from
  // JoinRequest.lastReadAt vs ChatMessage.createdAt, not an inbox notification.
  // See "Chat unread + push" below.
}

enum Platform {
  IOS
  ANDROID
}

model User {
  id                String              @id @default(uuid())
  phone             String              @unique
  name              String
  dob               DateTime
  gender            String
  genderVisible     Boolean             @default(true)
  latitude          Float?
  longitude         Float?
  profilePicture    String
  highlights        String[]
  proximityKm       Int                 @default(100)
  vibeTags          String[]            @default([])
  aggregatedRating  Float               @default(0)
  isMalice          Boolean             @default(false)
  isArchived        Boolean             @default(false)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  hostedEvents      Event[]             @relation("EventHost")
  joinRequests      JoinRequest[]
  chatMessages      ChatMessage[]
  reviewsWritten    Review[]
  personReviews     PersonReview[]      @relation("PersonReviewee")
  reviewReports     ReviewReport[]
  notifications     Notification[]
  verificationChecks VerificationCheck[]
  deviceTokens      DeviceToken[]

  @@index([latitude, longitude])
}

model VerificationCheck {
  id           String              @id @default(uuid())
  userId       String
  user         User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  type         VerificationType
  status       VerificationStatus  @default(PENDING)
  submittedAt  DateTime            @default(now())
  reviewedAt   DateTime?

  @@index([userId, type])
}

model Event {
  id                String            @id @default(uuid())
  hostId            String
  host              User              @relation("EventHost", fields: [hostId], references: [id])
  title             String
  date              DateTime            @db.Date
  time              DateTime?           @db.Time
  venue             String?
  entryMode         EntryMode           @default(APPROVE)
  seatsTotal        Int
  tags              String[]
  genderRestriction GenderRestriction @default(ANYONE)
  costMode          CostMode?
  isArchived        Boolean           @default(false)
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  joinRequests      JoinRequest[]
  chatMessages      ChatMessage[]
  reviews           Review[]

  @@index([date])
  @@index([hostId])
}

model JoinRequest {
  id         String             @id @default(uuid())
  eventId    String
  event      Event              @relation(fields: [eventId], references: [id], onDelete: Cascade)
  userId     String
  user       User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  status     JoinRequestStatus  @default(PENDING)
  introText  String?
  lastReadAt DateTime?
  createdAt  DateTime           @default(now())
  updatedAt  DateTime           @updatedAt

  @@unique([eventId, userId])
  @@index([eventId, status])
}

model ChatMessage {
  id         String   @id @default(uuid())
  eventId    String?
  event      Event?   @relation(fields: [eventId], references: [id], onDelete: Cascade)
  dmWithUserId String?
  authorId   String
  author     User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  text       String
  createdAt  DateTime @default(now())

  @@index([eventId, createdAt])
  @@index([dmWithUserId, createdAt])
}

model Review {
  id           String         @id @default(uuid())
  eventId      String
  event        Event          @relation(fields: [eventId], references: [id], onDelete: Cascade)
  reviewerId   String
  reviewer     User           @relation(fields: [reviewerId], references: [id], onDelete: Cascade)
  setupScores  Json
  setupTags    String[]
  createdAt    DateTime       @default(now())

  personReviews PersonReview[]

  @@unique([eventId, reviewerId])
}

model PersonReview {
  id           String         @id @default(uuid())
  reviewId     String
  review       Review         @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  revieweeId   String
  reviewee     User           @relation("PersonReviewee", fields: [revieweeId], references: [id], onDelete: Cascade)
  tags         String[]
  rating       Int?
  note         String?
  meetAgain    Boolean        @default(false)
  flagged      Boolean        @default(false)

  reports      ReviewReport[]

  @@unique([reviewId, revieweeId])
}

model ReviewReport {
  id              String        @id @default(uuid())
  personReviewId  String
  personReview    PersonReview  @relation(fields: [personReviewId], references: [id], onDelete: Cascade)
  reporterId      String
  reporter        User          @relation(fields: [reporterId], references: [id], onDelete: Cascade)
  reason          String
  status          ReportStatus  @default(OPEN)
  createdAt       DateTime      @default(now())
}

model Notification {
  id         String            @id @default(uuid())
  userId     String
  user       User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  kind       NotificationKind
  payload    Json
  read       Boolean           @default(false)
  createdAt  DateTime          @default(now())

  @@index([userId, read, createdAt])
}

model DeviceToken {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  platform    Platform
  pushToken   String   @unique
  lastSeenAt  DateTime @default(now())
  createdAt   DateTime @default(now())

  @@index([userId])
}

model OtpCode {
  id          String    @id @default(uuid())
  phone       String
  codeHash    String
  attempts    Int       @default(0)
  expiresAt   DateTime
  consumedAt  DateTime?
  createdAt   DateTime  @default(now())

  @@index([phone, expiresAt])
}
```

## Open decisions before this is wired up

- **`ChatMessage.dmWithUserId`** — `chatStore.requesterMsgs` (pre-approval DM
  between host and a requester) doesn't cleanly fit "message on an event". Modeled
  here as a nullable event FK + a nullable `dmWithUserId` peer column; revisit if a
  real 1:1 `Conversation` entity turns out cleaner once group DMs exist.
- **`JoinRequest` uniqueness** — `@@unique([eventId, userId])` blocks a user from
  filing two live requests for the same event. The client doesn't currently prevent
  this; decide whether re-requesting after a decline should update the existing row
  or is disallowed entirely.
- **Capacity check** — "can't approve past `seatsTotal`" is application logic (a
  transaction that counts `APPROVED` rows before flipping one to `APPROVED`), not a
  DB constraint — Postgres can't express "count of related rows ≤ N" declaratively.
- **Geo queries** (`Board`'s proximity feed) — `latitude`/`longitude` + a B-tree
  index is fine at seed-data scale; swap to PostGIS/`geography` + a GiST index once
  the event volume makes a bounding-box scan too slow.
- **Notification fan-out** — who writes these rows (a service call at the point of
  `JOIN_REQUEST`/`DECIDE`/`SUBMIT_REVIEW`, vs. a DB trigger)? Recommend explicit
  service-layer writes — keeps the fan-out logic visible in one place instead of
  hidden in triggers.
- **`OtpCode` has no `User` FK** — it's keyed by `phone` because a code can be
  requested before a `User` row exists (first-time signup). On successful verify,
  the service either creates the `User` (first signup) or looks one up by `phone`
  (returning login) — `OtpCode` itself never needs to know which.
- **`OtpCode` cleanup** — expired/consumed rows aren't deleted on read; they're
  swept by the same cron job that expires `JoinRequest`s (see
  [free-tier-launch-plan.md](./free-tier-launch-plan.md)), not deleted inline on
  every verify attempt.

### Chat unread + push — why no `MESSAGE_RECEIVED` kind

Two different problems, two different mechanisms — deliberately not merged into one
`Notification` kind:

- **Unread badge (in-app)**: `JoinRequest.lastReadAt` is a per-(user, event) read
  cursor. Unread count is `count(ChatMessage) where eventId = X and createdAt >
  lastReadAt` — computed at read time, updated on chat-open. No row is written per
  message; this alone answers "does ChatList show a badge."
- **Push (out-of-app)**: on `ChatMessage` insert, the service checks whether the
  recipient's realtime connection (SSE/WS) is live. If yes, push down that
  connection only — no `Notification` row, no APNs/FCM call (the open app renders it
  in-place or shows an in-app banner). If not connected, look up their
  `DeviceToken` rows and call Expo Push/APNs/FCM directly with a title/body — this
  path does **not** need a `Notification` table row either, since the inbox screen
  isn't the delivery mechanism for "phone buzzes," the chat itself is.
- **Decided**: no `MESSAGE_RECEIVED` kind. The inbox screen ("What you missed")
  stays scoped to join requests, approvals, and ratings; unread chat state is
  entirely client-determined (badge from the read cursor) and out-of-app delivery
  is entirely push (no inbox row). Chat never writes a `Notification` row.

## Migration path

1. `apps/server` gets a `prisma/schema.prisma` with the models above.
2. Seed script ports `data/activities.ts`, `data/people.ts`, `data/reviews.ts`,
   `data/chat.ts` into `User`/`Event`/`JoinRequest`/`ChatMessage`/`ReviewReceived`
   rows — keeps the same demo data for local dev.
3. Mobile `store/*Store` reducers stay as optimistic local state, but each mutating
   action (`PUBLISH_PLAN`, `DECIDE`, `SEND_MSG`, `SUBMIT_REVIEW`, ...) gets a
   matching API call; server response reconciles the optimistic write.
