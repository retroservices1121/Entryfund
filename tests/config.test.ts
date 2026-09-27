import assert from "node:assert/strict";
import { test } from "node:test";

delete process.env.WHOP_COMPANY_API_KEY;
process.env.WHOP_API_KEY="legacy_key";
process.env.WHOP_COMPANY_ID="biz_platform";
process.env.WHOP_WEBHOOK_SECRET="ws_test";
process.env.DATABASE_URL="postgresql://test:test@postgres.railway.internal:5432/railway";
delete process.env.PGSSLMODE;

test("legacy API key is accepted consistently and private Postgres is not forced into TLS",async()=>{
 const {assertFinancialConfig}=await import("../lib/env");
 assert.equal(assertFinancialConfig().apiKey,"legacy_key");
 const {db}=await import("../lib/db");
 const pool=db();
 assert.equal(pool.options.ssl,undefined);
 assert.equal(pool.options.connectionTimeoutMillis,5000);
 await pool.end();
});
