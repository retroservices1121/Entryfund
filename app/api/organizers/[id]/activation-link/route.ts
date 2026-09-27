import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createOrganizerOnboardingLink } from "@/lib/whop";
import { env } from "@/lib/env";

export async function POST(_request:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const result=await query("SELECT id,whop_account_id FROM organizers WHERE id=$1 LIMIT 1",[id]);
 const organizer=result.rows[0];
 if(!organizer)return NextResponse.json({error:"Organizer not found"},{status:404});
 if(!organizer.whop_account_id)return NextResponse.json({error:"Whop account is not provisioned"},{status:409});
 try{
  const url=await createOrganizerOnboardingLink({
   companyId:organizer.whop_account_id,
   returnUrl:`${env.appUrl}/dashboard?organizer=${encodeURIComponent(id)}&activated=1`,
   refreshUrl:`${env.appUrl}/dashboard?organizer=${encodeURIComponent(id)}`,
  });
  await query("UPDATE organizers SET verification_status='pending',updated_at=now() WHERE id=$1",[id]);
  return NextResponse.json({url});
 }catch(error){
  console.error("activation_link_failed",error);
  return NextResponse.json({error:"Unable to start verification"},{status:502});
 }
}
