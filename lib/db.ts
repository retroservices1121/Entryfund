import { Pool, type QueryResultRow } from "pg";
import { env } from "./env";

const globalForDb=globalThis as unknown as {entryfundPool?:Pool};

export function db(){
 if(!env.databaseUrl)throw new Error("DATABASE_URL is not configured");
 if(!globalForDb.entryfundPool)globalForDb.entryfundPool=new Pool({
  connectionString:env.databaseUrl,
  max:10,
  idleTimeoutMillis:30_000,
  connectionTimeoutMillis:5_000,
  ssl:env.databaseUrl.includes("localhost")?false:{rejectUnauthorized:false},
 });
 return globalForDb.entryfundPool;
}

export async function query<T extends QueryResultRow=QueryResultRow>(text:string,values:unknown[]=[]){
 return db().query<T>(text,values);
}

export async function transaction<T>(work:(client:import("pg").PoolClient)=>Promise<T>){
 const client=await db().connect();
 try{await client.query("BEGIN");const result=await work(client);await client.query("COMMIT");return result}
 catch(error){await client.query("ROLLBACK");throw error}
 finally{client.release()}
}
