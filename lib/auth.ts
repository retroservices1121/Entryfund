import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db";

const scrypt=promisify(scryptCallback);
export const sessionCookie="entryfund_session";
const sessionSeconds=7*24*60*60;

export type Session={userId:string;organizerId:string;role:"owner"|"admin"|"finance"};

export function sessionHash(token:string){return createHash("sha256").update(token).digest("hex")}

export async function hashPassword(password:string){
 const salt=randomBytes(32);
 const key=await scrypt(password,salt,64) as Buffer;
 return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password:string,stored:string){
 const parts=stored.split(":");
 if(parts.length!==3||parts[0]!=="scrypt"||!/^[0-9a-f]{64}$/.test(parts[1])||!/^[0-9a-f]{128}$/.test(parts[2]))return false;
 const actual=await scrypt(password,Buffer.from(parts[1],"hex"),64) as Buffer;
 return timingSafeEqual(actual,Buffer.from(parts[2],"hex"));
}

export function matchesInvitation(value:string){
 const expected=process.env.AUTH_SECRET?.trim();
 if(!expected||expected.length<32||!value)return false;
 return timingSafeEqual(createHash("sha256").update(value).digest(),createHash("sha256").update(expected).digest());
}

export function makeSessionToken(){return randomBytes(32).toString("base64url")}

export function setSessionCookie(token:string){
 return {name:sessionCookie,value:token,httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/",maxAge:sessionSeconds};
}

export async function persistSession(userId:string,organizerId:string){
 const token=makeSessionToken();
 await query("INSERT INTO sessions(token_hash,user_id,organizer_id,expires_at) VALUES($1,$2,$3,now()+interval '7 days')",[sessionHash(token),userId,organizerId]);
 return token;
}

export async function getSession():Promise<Session|null>{
 const token=(await cookies()).get(sessionCookie)?.value;
 if(!token||token.length>128)return null;
 const result=await query<{user_id:string;organizer_id:string;role:Session["role"]}>(
  `SELECT s.user_id,s.organizer_id,m.role
   FROM sessions s JOIN memberships m ON m.user_id=s.user_id AND m.organizer_id=s.organizer_id
   WHERE s.token_hash=$1 AND s.expires_at>now() LIMIT 1`,[sessionHash(token)]);
 const row=result.rows[0];
 return row?{userId:row.user_id,organizerId:row.organizer_id,role:row.role}:null;
}

export async function requireSession():Promise<Session>{
 const session=await getSession();
 if(!session)throw new Error("UNAUTHENTICATED");
 return session;
}

export async function requirePageSession(){
 const session=await getSession();
 if(!session)redirect("/login");
 return session;
}

export async function requireOrganizer(organizerId:string){
 const session=await getSession();
 return ownsOrganizer(session,organizerId)?session:null;
}

export function ownsOrganizer(session:Session|null,organizerId:string){
 return Boolean(session&&session.organizerId===organizerId);
}

export async function revokeSession(){
 const token=(await cookies()).get(sessionCookie)?.value;
 if(token)await query("DELETE FROM sessions WHERE token_hash=$1",[sessionHash(token)]);
}
