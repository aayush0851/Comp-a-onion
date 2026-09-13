# Push notifications — what's left

`apps/mobile/src/push.ts` requests permission and gets an Expo push token, and
`POST /device-tokens` stores it — but nothing sends a push yet. Two halves left:

## 1. Get real tokens (mobile/infra)

- [ ] `eas login` (needs an Expo account) then `eas init` from `apps/mobile` — this
      writes `extra.eas.projectId` into app config. Without it, `getExpoPushTokenAsync`
      has no project to issue a token against, so `push.ts` silently no-ops.
- [ ] iOS: upload an APNs key/cert via `eas credentials` (or let `eas build` prompt
      for it). Remote push does **not** work in Expo Go on iOS — needs a dev client
      or standalone build.
- [ ] Android: EAS-managed FCM v1 is the default now — just needs a Google Cloud
      service account linked via `eas credentials`, no manual `google-services.json`
      unless you want your own Firebase project.
- [ ] Build a dev client (`eas build --profile development`) or production build to
      actually test on a physical device — the Expo Go app won't do it.
- [ ] Verify token registration end-to-end: log in on a real build, confirm a row
      lands in `DeviceToken` via Prisma Studio or the DB.

## 2. Actually send pushes (backend)

- [ ] Add `expo-server-sdk` to `apps/server`.
- [ ] New `PushService` in `apps/server/src/notifications/` (or its own module):
      given a `userId`, look up their `DeviceToken` rows, batch-send via
      `Expo.sendPushNotificationsAsync`.
- [ ] Call it from `NotificationsService.create()` (`apps/server/src/notifications/notifications.service.ts`)
      so every in-app notification (`JOIN_REQUEST`, `APPROVAL`, `REVIEW_UNLOCKED`,
      `RATING_RECEIVED`) also fires a push, not just a DB row.
- [ ] Handle Expo push receipts / tickets: on `DeviceNotRegistered`, delete that
      `DeviceToken` row so we stop retrying a dead token.
- [ ] Decide notification copy per `NotificationKind` (title/body strings) — right
      now `payload` is a raw JSON blob with ids, nothing human-readable.

## 3. Client-side polish (once real pushes exist)

- [ ] `Notifications.addNotificationResponseReceivedListener` — deep-link a tapped
      push to the right screen (event detail, chat thread, etc.) instead of just
      opening the app to wherever it was.
- [ ] Badge count (optional) — `Notifications.setBadgeCountAsync`.
- [ ] Re-test the login/logout register/unregister cycle on a real build once
      tokens are real (it's currently only exercised with `projectId` absent, i.e.
      always a no-op).
