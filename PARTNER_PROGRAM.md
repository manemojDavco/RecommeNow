# Partner Program — Sprint 1 (attribution rails)

Tracks external partners (recruiters, influencers, student ambassadors) who refer
users, and records commission on cleared, non-refunded revenue — 30 days in
arrears. Same DB, same dashboard, three commission tables selected by
`partner_type`.

## Commission rules

| Type | Deal | USD | AUD | GBP | EUR |
|------|------|-----|-----|-----|-----|
| recruiter | 20% recurring share of **net**, 12 months | 20% / 12mo | same | same | same |
| influencer | flat bounty per paid conversion | $5 | A$8 | £4 | €5 |
| student | flat bounty per paid conversion (+ free PRO) | $3 | A$5 | £2.50 | €3 |

Amounts live on each `partners` row (`share_pct`, `share_months`, `bounty_cents`)
so a payout is always reproducible from the row. Defaults are seeded from
`lib/partners.ts` when a partner is created.

## Data model (`supabase/migration-partners.sql`)

- **partners** — id, name, email, `code` (unique → `/r/CODE`), partner_type,
  currency, commission config, status, optional `user_id` (dashboard login, Sprint 2).
- **profiles.referred_by_partner_id / referred_at** — attribution, **write-once**
  (enforced by the `profiles_lock_partner_attr` trigger). One user, one referrer.
- **commission_events** — one row per money event. Amounts in cents; refunds
  negative. `status`: pending → cleared → paid. `share_due_cents` filled at clearing.
  Idempotent on `external_event_id`.
- **payouts** — monthly statement per partner (Sprint 2 fills these).

RLS is enabled with **no policies** (deny-by-default); all writes use the
service-role key. Partner-scoped read policies come with the Sprint 2 dashboard.

## How attribution flows

1. **Web** — `recommenow.com/r/CODE` drops a 90-day `rn_partner` cookie, redirects
   to sign-up. `/api/profile/create` reads the cookie, resolves the code against
   `partners`, and stamps `referred_by_partner_id` once.
2. **Mobile** — pass `referral_code` in the `/api/profile/create` body (a signup
   field). Same resolution. *(UI field still to be added to the app.)*

## How commission is recorded

- **Stripe** (`invoice.paid`, `charge.refunded`) — matches the profile by
  `stripe_customer_id`; only partner-referred users produce events. Net = amount
  paid − processor fee (from the charge's balance transaction). First invoice =
  `conversion`, later = `renewal`, refunds = negative `refund`.
- **Apple** (`/api/iap/verify`) — records one `conversion` per referred user
  (idempotent per profile, so restores/re-verifies never double-pay). Renewals
  via App Store Server Notifications are a follow-up.

## Clearing (the trust anchor)

`/api/cron/partner-clearing` (nightly, 05:00 UTC) marks pending events `cleared`
30 days after they occurred and computes `share_due_cents` from the partner's
config (recruiter: % of net within the 12-month window; bounty: flat on
conversions, clawed back on refunds).

## Operator setup checklist

1. Run `supabase/migration-partners.sql` in Supabase.
2. In the **Stripe** dashboard, enable these events on the webhook endpoint:
   `invoice.paid`, `charge.refunded` (in addition to the existing subscription events).
3. Confirm `CRON_SECRET` is set (Vercel cron sends it as the Bearer token).
4. Create a partner:
   ```
   POST /api/admin/partners
   { "name": "Acme Recruiting", "email": "sam@acme.com",
     "partner_type": "recruiter", "currency": "gbp" }
   → returns { partner: { code: "rec-xxxxxx", ... } }
   ```
   Share `recommenow.com/r/rec-xxxxxx`.

## Not yet built (next sprints)

- Sprint 2: partner dashboard at `/partner` (auth + RLS, widgets, CSV statements).
- Sprint 3: the seven partner emails (welcome, first signup, conversions digest,
  monthly statement, payout sent, inactivity nudge, milestones).
- Apple App Store Server Notifications v2 endpoint (renewals/refunds for mobile).
- Mobile signup `referral_code` UI field.
