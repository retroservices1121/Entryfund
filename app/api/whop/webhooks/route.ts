import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

function verify(raw:string,signature:string|null){
 const secret=env.whopWebhookSecret;
 if(!secret||!signature)return false;
 const expected=createHmac("sha256",secret).update(raw).digest("hex");
 const supplied=signature.replace(/^sha256=/,"");
 if(expected.length!==supplied.length)return false;
 return timingSafeEqual(Buffer.from(expected),Buffer.from(supplied));
}

export async function POST(request:NextRequest){
 const raw=await request.text();
 const signature=request.headers.get("whop-signature")??request.headers.get("x-whop-signature");

 if(!verify(raw,signature)){
  return NextResponse.json({error:"Invalid webhook signature"},{status:401});
 }

 let payload:unknown;
 try{payload=JSON.parse(raw)}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}

 // Production processing contract:
 // 1. persist provider event ID in webhook_events (unique PK)
 // 2. return success immediately for already-seen events
 // 3. reconcile payment/card/refund/payout/withdrawal state transactionally
 // 4. mark processed_at only after successful reconciliation
 console.info(JSON.stringify({kind:"entryfund.whop_webhook",received:true}));

 return NextResponse.json({received:true});
}
