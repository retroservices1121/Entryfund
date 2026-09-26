-- EntryFund PostgreSQL schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS organizers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL,
 email text NOT NULL UNIQUE,
 verification_status text NOT NULL DEFAULT 'not_started' CHECK (verification_status IN ('not_started','pending','verified','restricted')),
 whop_account_id text UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memberships (
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 organizer_id uuid NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
 role text NOT NULL CHECK (role IN ('owner','admin','finance')),
 PRIMARY KEY(user_id,organizer_id)
);

CREATE TABLE IF NOT EXISTS collections (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organizer_id uuid NOT NULL REFERENCES organizers(id) ON DELETE CASCADE,
 slug text NOT NULL,
 name text NOT NULL,
 type text NOT NULL CHECK(type IN ('tournament','league','tryout','team','other')),
 event_date date,
 entry_fee_cents bigint NOT NULL CHECK(entry_fee_cents>=0),
 capacity integer CHECK(capacity IS NULL OR capacity>0),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','open','closed','settled')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organizer_id,slug)
);

CREATE TABLE IF NOT EXISTS registrations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE RESTRICT,
 participant_name text NOT NULL,
 email text NOT NULL,
 phone text,
 amount_cents bigint NOT NULL CHECK(amount_cents>0),
 status text NOT NULL CHECK(status IN ('pending','available','completed','failed','refunded')),
 provider_payment_id text UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expenses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
 organizer_id uuid NOT NULL REFERENCES organizers(id) ON DELETE RESTRICT,
 merchant text NOT NULL,
 description text,
 amount_cents bigint NOT NULL CHECK(amount_cents>0),
 status text NOT NULL CHECK(status IN ('pending','available','completed','failed','refunded')),
 provider_transaction_id text UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS awards (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE RESTRICT,
 recipient_name text NOT NULL,
 reason text NOT NULL,
 amount_cents bigint NOT NULL CHECK(amount_cents>0),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','ready','processing','completed','failed')),
 provider_payout_id text UNIQUE,
 idempotency_key text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS refunds (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE RESTRICT,
 amount_cents bigint NOT NULL CHECK(amount_cents>0),
 status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','processing','completed','failed')),
 provider_refund_id text UNIQUE,
 idempotency_key text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS withdrawals (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organizer_id uuid NOT NULL REFERENCES organizers(id) ON DELETE RESTRICT,
 amount_cents bigint NOT NULL CHECK(amount_cents>0),
 fee_cents bigint NOT NULL DEFAULT 0 CHECK(fee_cents>=0),
 status text NOT NULL DEFAULT 'requested' CHECK(status IN ('requested','in_transit','completed','failed','canceled','denied')),
 provider_withdrawal_id text UNIQUE,
 idempotency_key text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_events (
 id text PRIMARY KEY,
 provider text NOT NULL,
 event_type text NOT NULL,
 payload jsonb NOT NULL,
 processed_at timestamptz,
 received_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organizer_id uuid REFERENCES organizers(id) ON DELETE SET NULL,
 actor_id uuid,
 action text NOT NULL,
 entity_type text NOT NULL,
 entity_id text NOT NULL,
 metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS collections_organizer_idx ON collections(organizer_id);
CREATE INDEX IF NOT EXISTS registrations_collection_idx ON registrations(collection_id);
CREATE INDEX IF NOT EXISTS expenses_organizer_idx ON expenses(organizer_id);
CREATE INDEX IF NOT EXISTS expenses_collection_idx ON expenses(collection_id);
CREATE INDEX IF NOT EXISTS awards_collection_idx ON awards(collection_id);
CREATE INDEX IF NOT EXISTS audit_organizer_created_idx ON audit_log(organizer_id,created_at DESC);
