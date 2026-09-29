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
  let existingCards=0;
  try{existingCards=(await whop().cards.list({account_id:accountId})).data.length}
  catch(error){
   if(wallet.cards?.status==="approved")throw error;
   // Whop may block card listing before the account's card application is approved.
  }
  const phase=cardRequestPhase({role:session.role,hasAccount:true,hasBalanceAccess:Boolean(wallet.capabilities),
   hasAccountOwner:Boolean(wallet.ownerId),existingCards,applicationStatus:wallet.cards?.status??null,
   cardIssuingStatus:wallet.capabilities?.card_issuing??null});
  if(!phase||!wallet.ownerId)return NextResponse.json({error:"Whop card setup is not available for this account"},{status:409});
  const response=await whop().cards.create({account_id:accountId,assigned_user_id:wallet.ownerId,name:"Organizer card"},{idempotencyKey:idempotencyKey(["card",phase,session.organizerId])});
  const result=response as unknown as {object?:string;status?:string;hosted_url?:string};
  return NextResponse.json({object:result.object??"unknown",status:result.status??"pending",
   hostedUrl:result.hosted_url??null});
 }catch(error){
  console.error("card_setup_failed",{organizerId:session.organizerId,error});
  const detail=error instanceof Error?error.message.toLowerCase():"";
  const message=detail.includes("no approved identity verification")?"Whop needs the cardholder's identity verification before issuing a card. Open financial setup in Settings."
   :detail.includes("rain account is not approved")||detail.includes("already has a card application")?"Whop is still reviewing this account's card application."
   :detail.includes("must be a member of this account")?"Whop does not recognize the account owner as a cardholder. Check the connected account setup."
   :detail.includes("not authorized")||detail.includes("forbidden")?"The Whop API key cannot issue cards for this connected account. Check its permissions."
   :"Whop card setup is unavailable. Check card permissions and account eligibility.";
  return NextResponse.json({error:message},{status:502});
 }
}
