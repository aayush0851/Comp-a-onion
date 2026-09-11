# Backend Strategy — Supabase vs NestJS

Comparing the two options discussed for `apps/server`: keep the current NestJS scaffold, or drop it for Supabase (Postgres + auto-generated API + Edge Functions/RLS).

| Parameter | Supabase | NestJS (current [apps/server](../apps/server)) |
|---|---|---|
| Cost | Free tier covers early stage; one bill | Needs compute host (Railway/Render) + managed Postgres — two line items, both cheap/pauseable at this scale |
| Scalability | DB/auth/storage scale for you; Edge Functions have cold starts + execution timeouts | Scales like any Node service — horizontal replicas, full control over connection pooling |
| Dev speed | Instant CRUD/auth/storage, no boilerplate | Boilerplate (auth, CRUD) has to be written, but everything stays one language/framework |
| Fit for this schema's logic | Relational, multi-step, invariant-heavy writes (join-request capacity check + expiry, review scoring) end up split across Postgres RPCs, Edge Functions, and RLS policies — same code, more places to reason about it | Native fit — one service method per invariant, normal transactions |
| Vendor lock-in | Auth/storage/RLS coupled to the platform | Plain Postgres + Node — portable to any host |

## Recommendation

Keep NestJS. The domain logic here (approval flows, capacity checks, expiring join requests, derived review counts) is genuinely relational and transactional — Supabase doesn't remove that work, it just relocates it into DB functions + Edge Functions + RLS, which is more surface area to maintain than one NestJS service layer.

If the real pain point turns out to be hosting/ops rather than the logic itself, a middle ground exists: use Supabase (or Neon) **only as the managed Postgres**, and keep NestJS as the app server talking to it — skip their auto-API, Edge Functions, and RLS entirely.
