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
  const body=await request.json();
  const territoryName=cleanText(body.territoryName,"Territory name",120);
  const operatorEmail=validateEmail(body.operatorEmail);
  const amountCents=positiveCents(body.amountCents,"Territory fee");
  const result=await query<{id:string}>(
   "INSERT INTO territory_fees(organizer_id,territory_name,operator_email,amount_cents) VALUES($1,$2,$3,$4) RETURNING id",
   [session.organizerId,territoryName,operatorEmail,amountCents],
  );
  return NextResponse.json({territoryFeeId:result.rows[0].id},{status:201});
 }catch(error){
  if(error instanceof ValidationError)return NextResponse.json({error:error.message},{status:400});
  console.error("territory_fee_create_failed",error);
  return NextResponse.json({error:"Unable to create territory fee"},{status:503});
 }
}
