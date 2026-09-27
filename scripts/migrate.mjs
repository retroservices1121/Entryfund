import fs from "node:fs/promises";
import pg from "pg";

const connectionString=process.env.DATABASE_URL;
if(!connectionString){console.log("DATABASE_URL not set; skipping migration");process.exit(0)}
const sql=await fs.readFile(new URL("../db/schema.sql",import.meta.url),"utf8");
const client=new pg.Client({connectionString,ssl:connectionString.includes("localhost")?false:{rejectUnauthorized:false}});
try{await client.connect();await client.query(sql);console.log("EntryFund database schema ready")}finally{await client.end()}
