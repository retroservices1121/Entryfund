import fs from "node:fs/promises";
import pg from "pg";
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const connectionString=process.env.DATABASE_URL;
if(!connectionString){console.log("DATABASE_URL not set; skipping migration");process.exit(0)}
const sql=await fs.readFile(new URL("../db/schema.sql",import.meta.url),"utf8");
// pg honors sslmode in DATABASE_URL and PGSSLMODE. Railway private networking
// must not be forced into TLS just because its hostname is not localhost.
const client=new pg.Client({connectionString,connectionTimeoutMillis:5_000});
try{
 await client.connect();
 await client.query("BEGIN");
 await client.query("SET LOCAL lock_timeout = '10s'");
 await client.query("SET LOCAL statement_timeout = '60s'");
 await client.query("SELECT pg_advisory_xact_lock(731924081)");
 await client.query(sql);
 await client.query("COMMIT");
 console.log("EntryFund database schema ready");
}catch(error){
 await client.query("ROLLBACK").catch(()=>{});
 throw error;
}finally{await client.end()}
