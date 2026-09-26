# EntryFund database

The canonical production schema is `schema.sql`.

Apply it to a PostgreSQL database before enabling live financial operations. All monetary values are stored as integer cents. Provider identifiers are unique where replaying an event could otherwise duplicate money movement.

Important invariants:
- collections belong to exactly one organizer
- registrations belong to a collection
- card expenses always belong to an organizer and may be attributed to a collection
- awards/refunds/withdrawals use unique idempotency keys
- webhook event IDs are unique and must be persisted before processing
- financial records are not cascade-deleted with collections
- audit records are append-only at the application layer
