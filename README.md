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
- Create a one-time fee and share its single-use payment link
- Public player registration page
- Organizer financial dashboard
- Collection/event financial detail and P&L
- Whop account balance display (available, pending, and reserve USD)
- Whop card listing and owner-initiated card application/issuance
- Recorded payments and Whop card transaction activity
- Read-only award, refund, and withdrawal records
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
- `/dashboard/fees` create and track one-time fees
- `/pay/fee/[id]` one-time fee payment link
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
2. Run a complete Whop checkout and webhook test in sandbox or with a controlled live payment
3. Confirm connected-account verification status in the organizer workspace
4. Confirm balance and card API permissions for connected organizers in production
5. Complete Whop card application and issuance with an eligible organizer
6. Reconcile card transactions into collection expenses and add freeze/limit controls
7. Execute and reconcile full and partial refunds
8. Execute approved competitive payouts and track status
9. Execute withdrawals and apply the final pricing policy
10. Add dispute/chargeback handling, observability and production tests

Organizer finance screens now show records and Whop data instead of sample figures.
The card action is available only to the organizer owner. Whop decides whether an
account can apply for or receive a card; EntryFund does not issue cards itself or
show full card numbers. Payouts, refunds, and withdrawals remain read-only until
their provider operations are integrated.

One-time fees are separate from player registrations. An organizer records a fee
name, optional contact email, and amount, then shares the payment link. The
contact email is for the organizer's records; it does not restrict who can pay.
Whop limits the checkout plan to one purchase, and a verified payment webhook
marks the fee paid. Refund events flag a fee for review.

## Product boundary

EntryFund is **financial software for sports**, not sports-management software.
