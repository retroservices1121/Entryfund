import { NextRequest,NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cleanText,email as validateEmail,ValidationError } from "@/lib/validation";
import { createConnectedCompany,createOrganizerOnboardingLink } from "@/lib/whop";
import { env } from "@/lib/env";

export async function POST(request:NextRequest){
 try{
  const body=await request.json();
  const name=cleanText(body.name,"Organizer name",120);
  const email=validateEmail(body.email);

  let result=await query("SELECT * FROM organizers WHERE email=$1 LIMIT 1",[email]);
  let organizer=result.rows[0];

  if(!organizer){
   result=await query("INSERT INTO organizers(name,email) VALUES($1,$2) RETURNING *",[name,email]);
   organizer=result.rows[0];
  }

  if(!organizer.whop_account_id){
   const company=await createConnectedCompany({email,title:name,internalOrganizerId:organizer.id});
   const updated=await query(
    "UPDATE organizers SET whop_account_id=$1,updated_at=now() WHERE id=$2 RETURNING *",
    [company.id,organizer.id]
   );
   organizer=updated.rows[0];
  }

  const returnUrl=`${env.appUrl}/dashboard?organizer=${encodeURIComponent(organizer.id)}`;
  const onboardingUrl=await createOrganizerOnboardingLink({
   companyId:organizer.whop_account_id,
   returnUrl,
   refreshUrl:`${env.appUrl}/onboarding`,
  });

  return NextResponse.json({organizer,onboardingUrl},{status:201});
 }catch(error){
  if(error instanceof ValidationError)return NextResponse.json({error:error.message},{status:400});
  console.error("organizer_bootstrap_failed",error);
  return NextResponse.json({error:"Unable to create organizer financial account"},{status:502});
 }
}
