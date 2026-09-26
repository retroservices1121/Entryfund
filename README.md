# EntryFund

**Financial infrastructure for sports organizers.**

EntryFund is not sports-management software. It does not manage brackets, scoring, scheduling, standings, or team chat.

The product financial loop is:

**Collect registrations → manage event revenue → spend from the same balance → withdraw profit**

## V1 surfaces

- Organizer dashboard
- Create registration/collection
- Public registration page
- Balance and virtual-card experience
- Transaction activity
- Whop integration boundary
- Whop webhook endpoint scaffold

## Product architecture

- **Organizer** = financial connected account / verification subject
- **Collection/Event** = EntryFund accounting object
- **Player** = payer; does not need an EntryFund account
- **Virtual card** = organizer spending instrument
- **Whop** = payments, balance, connected-account/KYC, card issuing, payouts infrastructure

Events do **not** create separate KYC identities. One verified organizer may create many collections.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment variables planned

```
WHOP_API_KEY=
WHOP_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=
```

Do not commit live financial credentials.

## Next integration work

1. Organizer authentication and persistent database
2. Connected-account creation / verification state
3. Live Whop checkout creation
4. Payment webhook reconciliation
5. Balance retrieval
6. Virtual card issuance and controls
7. Refund flow
8. Withdrawal flow and pricing
9. Event-level financial ledger and P&L
