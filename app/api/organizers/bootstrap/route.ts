import { NextRequest,NextResponse } from "next/server";
import { query,transaction } from "@/lib/db";
import { getSession,hashPassword,matchesInvitation,persistSession,setSessionCookie } from "@/lib/auth";
import { cleanText,email as validateEmail,ValidationError } from "@/lib/validation";
import { createConnectedCompany } from "@/lib/whop";
import { sameOrigin } from "@/lib/request-security";

async function provision(organizer:{id:string;email:string;name:string;whop_account_id:string|null}){
 if(organizer.whop_account_id)return true;
 try{
  const company=await createConnectedCompany({email:organizer.email,title:organizer.name,internalOrganizerId:organizer.id});
  await query("UPDATE organizers SET whop_account_id=$1,updated_at=now() WHERE id=$2 AND whop_account_id IS NULL",[company.id,organizer.id]);
  return true;
 }catch(error){
  console.error("organizer_provision_failed",error);
  return false;
 }
}

export async function POST(request:NextRequest){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin"},{status:403});
 const session=await getSession();
 if(session){
  if(session.role==="finance")return NextResponse.json({error:"Owner access required"},{status:403});
  const result=await query<{id:string;email:string;name:string;whop_account_id:string|null}>("SELECT id,email,name,whop_account_id FROM organizers WHERE id=$1",[session.organizerId]);
  if(!result.rows[0])return NextResponse.json({error:"Organizer not found"},{status:404});
  const ready=await provision(result.rows[0]);
  return NextResponse.json({organizerId:session.organizerId,provisioningPending:!ready});
 }
 if(!process.env.AUTH_SECRET||process.env.AUTH_SECRET.trim().length<32)return NextResponse.json({error:"Invitations are not configured"},{status:503});
 try{
  const body=await request.json();
  const name=cleanText(body.name,"Organizer name",120);
  const email=validateEmail(body.email);
  const password=body.password;
  if(typeof password!=="string"||password.length<12||password.length>128)throw new ValidationError("Password must be 12 to 128 characters");
  if(typeof body.invitationCode!=="string"||!matchesInvitation(body.invitationCode))return NextResponse.json({error:"Invalid invitation code"},{status:403});
  const passwordHash=await hashPassword(password);
  const account=await transaction(async client=>{
   const existingUser=await client.query<{id:string;password_hash:string|null}>("SELECT id,password_hash FROM users WHERE email=$1 FOR UPDATE",[email]);
   if(existingUser.rows[0]?.password_hash)return null;
   let userId=existingUser.rows[0]?.id;
   if(userId)await client.query("UPDATE users SET password_hash=$1 WHERE id=$2",[passwordHash,userId]);
   else{
    const user=await client.query<{id:string}>("INSERT INTO users(email,password_hash) VALUES($1,$2) RETURNING id",[email,passwordHash]);
    userId=user.rows[0].id;
   }
   const existingOrg=await client.query<{id:string;email:string;name:string;whop_account_id:string|null}>("SELECT id,email,name,whop_account_id FROM organizers WHERE email=$1 FOR UPDATE",[email]);
   const organizer=existingOrg.rows[0]??(await client.query<{id:string;email:string;name:string;whop_account_id:string|null}>(
    "INSERT INTO organizers(name,email) VALUES($1,$2) RETURNING id,email,name,whop_account_id",[name,email])).rows[0];
   await client.query("INSERT INTO memberships(user_id,organizer_id,role) VALUES($1,$2,'owner') ON CONFLICT(user_id,organizer_id) DO NOTHING",[userId,organizer.id]);
   return {userId,organizer};
  });
  if(!account)return NextResponse.json({error:"Account already exists. Sign in instead."},{status:409});
  const token=await persistSession(account.userId,account.organizer.id);
  const ready=await provision(account.organizer);
  const response=NextResponse.json({organizerId:account.organizer.id,provisioningPending:!ready},{status:201});
  response.cookies.set(setSessionCookie(token));
  return response;
 }catch(error){
  if(error instanceof ValidationError)return NextResponse.json({error:error.message},{status:400});
  console.error("organizer_bootstrap_failed",error);
  return NextResponse.json({error:"Unable to create organizer account"},{status:503});
 }
}
