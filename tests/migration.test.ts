import assert from "node:assert/strict";
import { test } from "node:test";
import pg from "pg";

process.env.DATABASE_URL="postgresql://test:test@postgres.railway.internal:5432/railway";

test("startup migration uses a bounded transaction and releases its connection",async(t)=>{
 const sql:string[]=[];
 let ended=false;
 t.mock.method(pg.Client.prototype,"connect",async()=>{});
 t.mock.method(pg.Client.prototype,"query",async(statement:string)=>{sql.push(statement);return {rows:[]}});
 t.mock.method(pg.Client.prototype,"end",async()=>{ended=true});
 // The startup entrypoint is JavaScript and executes once when imported.
 const path="../scripts/migrate.mjs";
 await import(path);
 assert.equal(sql[0],"BEGIN");
 assert.ok(sql.some(s=>s.includes("lock_timeout")));
 assert.ok(sql.some(s=>s.includes("statement_timeout")));
 assert.ok(sql.some(s=>s.includes("pg_advisory_xact_lock")));
 assert.ok(sql.some(s=>s.includes("CREATE TABLE IF NOT EXISTS registrations")));
 assert.ok(sql.some(s=>s.includes("CREATE TABLE IF NOT EXISTS territory_fees")));
 assert.equal(sql.at(-1),"COMMIT");
 assert.equal(ended,true);
});
