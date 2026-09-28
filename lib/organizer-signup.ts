import type { PoolClient } from "pg";

export class AccountExistsError extends Error {
 constructor(){super("Account already exists. Sign in instead.");this.name="AccountExistsError"}
}

export async function createOrganizerAccount(client:Pick<PoolClient,"query">,name:string,email:string,passwordHash:string){
 const existing=await client.query(
  "SELECT 1 FROM users WHERE email=$1 UNION ALL SELECT 1 FROM organizers WHERE email=$1 LIMIT 1",
  [email],
 );
 if(existing.rowCount)throw new AccountExistsError();
 const user=await client.query<{id:string}>("INSERT INTO users(email,password_hash) VALUES($1,$2) RETURNING id",[email,passwordHash]);
 const organizer=await client.query<{id:string;email:string;name:string;whop_account_id:string|null}>(
  "INSERT INTO organizers(name,email) VALUES($1,$2) RETURNING id,email,name,whop_account_id",
  [name,email],
 );
 await client.query("INSERT INTO memberships(user_id,organizer_id,role) VALUES($1,$2,'owner')",[user.rows[0].id,organizer.rows[0].id]);
 return {userId:user.rows[0].id,organizer:organizer.rows[0]};
}
