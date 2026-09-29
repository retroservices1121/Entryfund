# Railway deployment

## Reproducible validation

Use Node 22 and npm 10.9.2. Install with `npm ci`, then run `npm run check`.
The check runs TypeScript, regression tests, and the full Next.js production build.
The lockfile fixes the dependency tree, including platform-specific Next.js binaries.
There is no ESLint configuration; the old interactive `next lint` script was removed.

Railway reads `railway.json`: Railpack builds with `npm run check`, then `npm start`
runs the schema migration and starts Next.js on `0.0.0.0` and Railway's `PORT`.
Keep development dependencies available during the build; do not set
`NPM_CONFIG_OMIT=dev` or `NPM_CONFIG_PRODUCTION=true` for installation.
Remove dashboard build/start overrides if they conflict with this configuration.

## Variables

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Reference the Railway Postgres service's private connection URL. |
| `NEXT_PUBLIC_APP_URL` | The complete public HTTPS application origin, without a trailing slash. |
| `WHOP_COMPANY_API_KEY` | The platform's Account API key; `WHOP_API_KEY` remains an accepted alias. |
| `WHOP_COMPANY_ID` | The platform account ID (`biz_...`). The key determines the parent of newly created connected accounts. |
| `WHOP_WEBHOOK_SECRET` | Exact endpoint signing secret, including its `ws_` prefix. |
| `WHOP_SANDBOX` | `true` for sandbox keys and webhooks; `false` for production. |

No credentials are needed to compile. Without `DATABASE_URL`, the migration logs
that it was skipped and the existing UI can start. Database-backed operations
require a configured database. A configured but unreachable database fails startup.
Migrations are transactional, serialized across replicas, and bounded by timeouts.
Both migrations and application queries honor pg's connection URL / `PGSSLMODE`
settings. For external databases, use the provider's documented TLS configuration;
the application no longer disables certificate checks or forces TLS by hostname.

`/api/health` is the Railway process healthcheck. `/api/ready` separately checks
database connectivity and the presence of Whop settings; it does not validate
credentials against Whop. A successful healthcheck is not proof of payment readiness.

## Organizer access

Organizers can create an account at `/onboarding` with their work email and a
password of at least 12 characters. Existing user or organizer emails cannot be
claimed through public signup; they must sign in at `/login`. Legacy organizer
records created before account signup require a separate, verified recovery path.
`AUTH_SECRET` is no longer read by the application and can be removed from Railway.

Passwords are salted and hashed with scrypt. Sessions are stored in Postgres and
sent to browsers in HTTP-only, SameSite cookies that require HTTPS in production.
The session is valid for seven days and can be revoked with Sign out. Login attempts
are limited per email. Organizer pages and APIs resolve the organizer from the
server-side session. Public registration pages and payment webhooks remain public.

The migration adds password hashes, sessions, and login attempts without deleting
existing organizers or collections. Public signup currently has no email verification
or automated abuse controls. Add those before broad promotion; the Whop account
verification flow remains separate.

Organizers can create multiple one-time fees at `/dashboard/fees`. Each fee has
a name, optional contact email, amount, and public payment link. The link is not
emailed automatically, and the contact email does not restrict who can pay. The
Whop checkout uses a dedicated one-time plan with stock 1. Signed payment
webhooks mark the fee paid; refund events mark it for review because partial
refunds need reconciliation. Existing territory fee records and payment links
are migrated to the generic fee model without changing their IDs. Old
`/pay/territory/[id]` links redirect to `/pay/fee/[id]`, and the webhook still
accepts metadata from checkout sessions created before the migration.
The organizer can start or resume Whop financial setup from `/settings`; that
screen shows the organizer's actual account details instead of sample verification
claims. One-time fee payment confirmation checks the Whop checkout ID, connected
account, USD amount, and signed webhook; the return page can also reconcile a
paid Whop payment when webhook delivery is delayed.

The dashboard reads the connected Whop account's USD available, pending, and
reserve holdings. If balance access is absent or the account has no USD holding,
it says "Unavailable" rather than calculating a provider balance from sales.
The card page lists Whop-issued cards and their status. The organizer owner can
start a card application, or issue one card after approval, through Whop. This
requires the account and API key to have balance/card permissions. The action
uses an idempotency key and will not create another card when one already exists.
Card transactions are read from Whop on the Transactions page; payouts, refunds,
and withdrawals are currently read-only EntryFund records.

## Whop contract

The application pins `@whop/sdk` 1.1.5 and API date `2026-09-15`, matching that
release's generated types. Use `WhopClient({token, baseUrl})`, `accounts.create`,
`account_id`, and `payments.retrieve({id})`. Connected account creation uses the
Account API key's parent; `parent_company_id` is not a supported request field.
The checkout contract no longer accepts `application_fee_amount` in an inline plan.
Configure platform fees in Whop separately if needed; this pass adds no fee feature.

Register `https://YOUR_DOMAIN/api/whop/webhooks` in the same Whop environment as
the key. Pin the webhook to API date `2026-09-15` as well. Subscribe to
`payment.succeeded`, `payment.failed`, `refund.created`, and `refund.updated`,
including connected-account events where appropriate.
The SDK's standalone `unwrapWebhook` helper verifies the raw body, exact signing
secret, signature headers, and five-minute timestamp window. The payload is then
validated before a database transaction. Delivery IDs deduplicate successful
processing; a database failure rolls back the event so Whop can retry it.

Official references checked for this stabilization:

- [Whop TypeScript SDK and generated source](https://github.com/whopio/whopsdk-typescript)
- [Create Account](https://docs.whop.com/api-reference/beta/accounts/create-account)
- [Account links](https://docs.whop.com/api-reference/account-links/create-account-link)
- [Webhook verification](https://docs.whop.com/developer/guides/webhooks)
- [Railpack Node configuration](https://railpack.com/languages/node)
- [Railway healthchecks](https://docs.railway.com/deployments/healthchecks)
- [node-postgres TLS configuration](https://node-postgres.com/features/ssl)

Some Whop quickstart/blog snippets still show the older default `Whop` constructor
or `webhooks.unwrap`. The installed release's type declarations and wire tests are
the compatibility check for this project.

## Scope and remaining limits

The first stabilization commit covered installation, SDK requests, webhook handling,
and deployment configuration. The following access-control pass added sign-in,
sessions, and organizer ownership checks. Public signup does not verify email
ownership; existing accounts cannot be claimed by matching their email. The
organizer finance screens no longer display demonstration figures.
Partial refund accounting remains limited by the existing registration-level
refunded status. Reconcile these flows before live money movement.

Local tests stub Whop HTTP responses and database connections; they do not prove
live credentials, Railway connectivity, or Whop account permissions. Validate those
with the deployed readiness route and Whop sandbox after deployment.

## Local validation on 2026-09-27

- Clean `npm ci` from the lockfile: passed (Node 22.16.0, npm 10.9.2, Windows).
- `npm run check` with the previous `.next` directory removed: passed, including
  route generation, TypeScript, four regression tests, and all 17 static pages.
- `npm start` on a non-default `PORT`: passed; 11 UI/health routes returned 200.
- Missing-configuration checks: readiness returned 503 and the webhook returned
  its configuration error without processing a payload.
- Dependency audit after the PostCSS override: zero reported vulnerabilities.
- `git diff --check`: passed.

The referenced task supplied its text and an older pasted Railway failure log,
but did not expose the latest uploaded log files. The local typecheck independently
reproduced the reported `baseURL` failure and found the four other SDK mismatches.
A live PostgreSQL migration and Railway deployment have not been verified locally.
