# EntryFund

**Financial infrastructure for sports organizers.**

> They run the sport. We run the money.

EntryFund is a sports-fintech product for leagues, tournament directors, clubs and independent organizers. It deliberately does **not** manage brackets, scoring, schedules, standings or team chat.

The product financial loop is:

**Collect registrations → manage event revenue → spend from the same balance → track competitive payouts → withdraw profit**

## Current V1

- High-impact sports + fintech landing experience
- Organizer onboarding and verification state UX
- Create registration / financial collection
- Public player registration page
- Organizer financial dashboard
- Collection/event financial detail and P&L
- Virtual-card workspace
- Unified transaction ledger
- Competitive award / payout ledger
- Refund tracking
- Withdrawal history
- Organizer settings
- Shared financial domain model and ledger calculations
- Whop provider integration boundary
- Whop webhook endpoint scaffold
- Health endpoint and environment template

## Architecture

- **Organizer** = financial connected account and KYC/KYB subject
- **Collection/Event** = EntryFund accounting object; it is not a separate KYC identity
- **Participant** = payer; does not need an EntryFund organizer account
- **Registration** = revenue tied to a collection
- **Expense** = organizer card spend attributed to a collection
- **Award** = organizer-entered competitive payout obligation; EntryFund does not determine winners
- **Refund** = money returned against an original registration
- **Withdrawal** = organizer transfer of available funds out of EntryFund
- **Whop** = intended payments, connected-account verification, balance, virtual-card and payout infrastructure

## Routes

- `/` landing
- `/onboarding` organizer setup
- `/login` organizer sign-in
- `/dashboard` financial overview
- `/events/new` create collection
- `/events/[slug]` public registration
- `/dashboard/events/[slug]` collection finances
- `/card` virtual card
- `/transactions` ledger
- `/payouts` competitive awards
- `/refunds` refund tracking
- `/withdrawals` external withdrawals
- `/settings` organizer verification/settings
- `/api/whop/webhooks` provider webhook scaffold
- `/api/health` health check

## Local development

```bash
npm ci
npm run check
npm run dev
```

Copy `.env.example` to `.env.local` and add credentials locally. Never commit live financial credentials.

See [deployment configuration and validation](DEPLOYMENT.md) for Railway variables,
startup behavior, the pinned Whop SDK contract, and remaining production limits.

## Remaining production integrations

The UI and domain boundaries are intentionally provider-ready, but live money movement must not be simulated.

1. Add email verification and signup abuse controls before broad promotion
2. Run a complete Whop sandbox checkout and webhook test
3. Confirm connected-account verification status in the organizer workspace
4. Retrieve real organizer balances and replace demonstration finance screens
5. Issue/manage real virtual cards
6. Execute and reconcile full and partial refunds
7. Execute approved competitive payouts and track status
8. Execute withdrawals and apply the final pricing policy
9. Add dispute/chargeback handling, observability and production tests

## Product boundary

EntryFund is **financial software for sports**, not sports-management software.
