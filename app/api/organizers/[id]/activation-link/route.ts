import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { createOrganizerVerification,whop } from "@/lib/whop";
import { getSession,ownsOrganizer } from "@/lib/auth";
import { sameOrigin } from "@/lib/request-security";
import { cardErrorForOwner } from "@/lib/card-error";

export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin"},{status:403});
 const session=await getSession();
 if(!session)return NextResponse.json({error:"Sign in required"},{status:401});
 if(session.role==="finance")return NextResponse.json({error:"Owner access required"},{status:403});
 const {id}=await params;
 if(!ownsOrganizer(session,id))return NextResponse.json({error:"Organizer not found"},{status:404});
 const result=await query<{whop_account_id:string|null}>("SELECT whop_account_id FROM organizers WHERE id=$1 LIMIT 1",[id]);
 const accountId=result.rows[0]?.whop_account_id;
 if(!accountId)return NextResponse.json({error:"Whop account is not provisioned"},{status:409});
 const body=await request.json().catch(()=>null);
 const kind=body?.kind;
 if(kind!=="individual"&&kind!=="business")return NextResponse.json({error:"Choose individual or business verification"},{status:400});
 try{
  const account=await whop().accounts.retrieve({id:accountId});
  if(account.id!==accountId)throw new Error("Whop account mismatch");
  const current=account.verification?.[kind] as {status?:string}|null|undefined;
  if(current?.status==="approved"){
   await query("UPDATE organizers SET verification_status='verified',updated_at=now() WHERE id=$1",[id]);
   return NextResponse.json({status:"approved",url:null});
  }
  const verification=await createOrganizerVerification(accountId,kind);
  const url=verification.session_url??null;
  if(url&&new URL(url).protocol!=="https:")throw new Error("Whop verification URL is not secure");
  if(url)await query("UPDATE organizers SET verification_status='pending',updated_at=now() WHERE id=$1",[id]);
  return NextResponse.json({status:verification.status??"unknown",url,
   requestedInformation:verification.requested_information?.map(item=>item.label).filter(Boolean)??[]});
 }catch(error){
  const detail=cardErrorForOwner(error);
  console.error("verification_start_failed",{organizerId:id,kind,status:detail.status,requestId:detail.requestId});
  return NextResponse.json({error:detail.message.startsWith("Whop says:")?detail.message:
   "Whop could not start verification. Please try again or contact Whop support.",requestId:detail.requestId},{status:502});
 }
}
