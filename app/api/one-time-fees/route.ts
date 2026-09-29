import { NextRequest,NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { sameOrigin } from "@/lib/request-security";
import { cleanText,email as validateEmail,positiveCents,ValidationError } from "@/lib/validation";

export async function POST(request:NextRequest){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin"},{status:403});
 const session=await getSession();
 if(!session)return NextResponse.json({error:"Sign in required"},{status:401});
 if(session.role==="finance")return NextResponse.json({error:"Owner access required"},{status:403});
 try{
  const body=await request.json().catch(()=>{throw new ValidationError("Invalid fee details")});
  if(!body||typeof body!=="object"||Array.isArray(body))throw new ValidationError("Invalid fee details");
  const title=cleanText(body.title??body.territoryName,"Fee name",120);
  const contact=body.contactEmail??body.operatorEmail;
  const contactEmail=contact?validateEmail(contact):null;
  const amountCents=positiveCents(body.amountCents,"One-time fee");
  const result=await query<{id:string}>(
   "INSERT INTO one_time_fees(organizer_id,title,contact_email,amount_cents) VALUES($1,$2,$3,$4) RETURNING id",
   [session.organizerId,title,contactEmail,amountCents],
  );
  return NextResponse.json({feeId:result.rows[0].id},{status:201});
 }catch(error){
  if(error instanceof ValidationError)return NextResponse.json({error:error.message},{status:400});
  console.error("one_time_fee_create_failed",error);
  return NextResponse.json({error:"Unable to create one-time fee"},{status:503});
 }
}
