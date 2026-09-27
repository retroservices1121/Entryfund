import { NextRequest,NextResponse } from "next/server";
import { query } from "@/lib/db";
import { persistSession,setSessionCookie,verifyPassword } from "@/lib/auth";
import { sameOrigin } from "@/lib/request-security";

export async function POST(request:NextRequest){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin"},{status:403});
 let body:Record<string,unknown>;
 try{body=await request.json()}catch{return NextResponse.json({error:"Invalid request"},{status:400})}
 const email=typeof body.email==="string"?body.email.trim().toLowerCase():"";
 const password=typeof body.password==="string"?body.password:"";
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length>128)return NextResponse.json({error:"Invalid credentials"},{status:401});
 try{
  const attempts=await query<{attempts:number}>("SELECT attempts FROM login_attempts WHERE email=$1 AND reset_at>now()",[email]);
  if((attempts.rows[0]?.attempts??0)>=10)return NextResponse.json({error:"Too many attempts. Try again later."},{status:429});
  const result=await query<{id:string;password_hash:string|null;organizer_id:string}>(
   `SELECT u.id,u.password_hash,m.organizer_id FROM users u
    JOIN memberships m ON m.user_id=u.id WHERE u.email=$1 AND m.role IN ('owner','admin','finance')
    ORDER BY m.organizer_id LIMIT 1`,[email]);
  const user=result.rows[0];
  if(!user?.password_hash||!password||!(await verifyPassword(password,user.password_hash))){
   await query(`INSERT INTO login_attempts(email,attempts,reset_at) VALUES($1,1,now()+interval '15 minutes')
    ON CONFLICT(email) DO UPDATE SET attempts=CASE WHEN login_attempts.reset_at<now() THEN 1 ELSE login_attempts.attempts+1 END,
    reset_at=CASE WHEN login_attempts.reset_at<now() THEN now()+interval '15 minutes' ELSE login_attempts.reset_at END`,[email]);
   return NextResponse.json({error:"Invalid credentials"},{status:401});
  }
  await query("DELETE FROM login_attempts WHERE email=$1",[email]);
  const token=await persistSession(user.id,user.organizer_id);
  const response=NextResponse.json({organizerId:user.organizer_id});
  response.cookies.set(setSessionCookie(token));
  return response;
 }catch(error){
  console.error("login_failed",error);
  return NextResponse.json({error:"Sign in is unavailable"},{status:503});
 }
}
