import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { idempotencyKey } from "@/lib/idempotency";
import { sameOrigin } from "@/lib/request-security";
import { getOrganizerWallet } from "@/lib/wallet";
import { whop } from "@/lib/whop";
import { cardRequestPhase } from "@/lib/card-eligibility";

export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin"},{status:403});
 const session=await getSession();
 if(!session)return NextResponse.json({error:"Sign in required"},{status:401});
 if(session.role!=="owner")return NextResponse.json({error:"Organizer owner access required"},{status:403});
 const result=await query<{whop_account_id:string|null}>("SELECT whop_account_id FROM organizers WHERE id=$1",[session.organizerId]);
 const accountId=result.rows[0]?.whop_account_id;
 if(!accountId)return NextResponse.json({error:"Complete Whop financial setup first"},{status:409});
 try{
  const wallet=await getOrganizerWallet(accountId);
  const cards=await whop().cards.list({account_id:accountId});
  const phase=cardRequestPhase({role:session.role,hasAccount:true,hasBalanceAccess:Boolean(wallet.capabilities),
   hasAccountOwner:Boolean(wallet.ownerId),existingCards:cards.data.length,applicationStatus:wallet.cards?.status??null});
  if(!phase||!wallet.ownerId)return NextResponse.json({error:"Whop card setup is not available for this account"},{status:409});
  const card=await whop().cards.create({account_id:accountId,assigned_user_id:wallet.ownerId,name:"Organizer card"},{idempotencyKey:idempotencyKey(["card",phase,session.organizerId])});
  return NextResponse.json({status:card.status||"pending"});
 }catch(error){
  console.error("card_setup_failed",{organizerId:session.organizerId,error});
  return NextResponse.json({error:"Whop card setup is unavailable. Check card permissions and account eligibility."},{status:502});
 }
}
