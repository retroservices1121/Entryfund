import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createOrganizerOnboardingLink } from "@/lib/whop";
import { env } from "@/lib/env";
import { getSession,ownsOrganizer } from "@/lib/auth";
import { sameOrigin } from "@/lib/request-security";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin"},{status:403});
 const session=await getSession();
 if(!session)return NextResponse.json({error:"Sign in required"},{status:401});
 if(session.role==="finance")return NextResponse.json({error:"Owner access required"},{status:403});
 const {id}=await params;
 if(!ownsOrganizer(session,id))return NextResponse.json({error:"Organizer not found"},{status:404});
 const result=await query("SELECT id,whop_account_id FROM organizers WHERE id=$1 LIMIT 1",[id]);
 const organizer=result.rows[0];
 if(!organizer)return NextResponse.json({error:"Organizer not found"},{status:404});
 if(!organizer.whop_account_id)return NextResponse.json({error:"Whop account is not provisioned"},{status:409});
 try{
  const url=await createOrganizerOnboardingLink({
   companyId:organizer.whop_account_id,
   returnUrl:`${env.appUrl}/settings?setup=returned`,
   refreshUrl:`${env.appUrl}/settings`,
  });
  await query("UPDATE organizers SET verification_status='pending',updated_at=now() WHERE id=$1",[id]);
  return NextResponse.json({url});
 }catch(error){
  console.error("activation_link_failed",error);
  return NextResponse.json({error:"Unable to start verification"},{status:502});
 }
}
