import { NextResponse } from "next/server";
import { unwrapWebhook } from "@whop/sdk/helpers";
import { z } from "zod";
import { env } from "@/lib/env";
import { transaction } from "@/lib/db";

const eventSchema=z.object({
 id:z.string().min(1),
 type:z.string().min(1),
 data:z.record(z.string(),z.unknown()),
});

function metadataOf(data:Record<string,unknown>){
 const value=data.metadata;
 return value&&typeof value==="object"
  ?value as Record<string,unknown>
  :{};
}

function paidUsdCents(value:unknown){
 if(!value||typeof value!=="object")return null;
 const money=value as Record<string,unknown>;
 if(money.currency!=="usd"||typeof money.amount!=="string"||!/^\d{1,7}(?:\.\d{1,2})?$/.test(money.amount))return null;
 const [dollars,cents=""]=money.amount.split(".");
 return Number(dollars)*100+Number(cents.padEnd(2,"0"));
}

export async function POST(request:Request){
 if(!env.whopWebhookSecret){
  return NextResponse.json({error:"Webhook secret is not configured"},{status:500});
 }

 const raw=await request.text();
 const headers=Object.fromEntries(request.headers.entries());

 let verified:unknown;
 try{
  verified=unwrapWebhook(raw,{headers,key:env.whopWebhookSecret});
 }catch{
  return NextResponse.json({error:"bad signature"},{status:401});
 }

 const parsed=eventSchema.safeParse(verified);
 if(!parsed.success)return NextResponse.json({error:"invalid webhook payload"},{status:400});
 const event=parsed.data;

 const deliveryId=headers["webhook-id"]??event.id;
 if(!deliveryId){
  return NextResponse.json({error:"missing webhook id"},{status:400});
 }

 try{
  const outcome=await transaction(async client=>{
   const inserted=await client.query(
    `INSERT INTO webhook_events(id,provider,event_type,payload)
     VALUES($1,'whop',$2,$3::jsonb)
     ON CONFLICT(id) DO NOTHING
     RETURNING id`,
    [deliveryId,event.type,raw]
   );

   if(inserted.rowCount===0)return "duplicate";

   if(event.type==="payment.succeeded"||event.type==="payment.failed"){
    const metadata=metadataOf(event.data);
    const paymentId=typeof event.data.id==="string"?event.data.id:null;
    const registrationId=
     typeof metadata.registration_id==="string"
      ?metadata.registration_id
      :null;

    if(metadata.kind==="entryfund_registration"&&registrationId){
     if(event.type==="payment.succeeded"){
      await client.query(
       `UPDATE registrations
        SET status='completed',
            provider_payment_id=COALESCE(provider_payment_id,$1)
        WHERE id=$2
          AND status IN ('pending','available','failed')`,
       [paymentId,registrationId]
      );
     }else{
      await client.query(
       "UPDATE registrations SET status='failed' WHERE id=$1 AND status='pending'",
       [registrationId]
      );
     }
    }
    const territoryFeeId=typeof metadata.territory_fee_id==="string"?metadata.territory_fee_id:null;
    if(metadata.kind==="entryfund_territory_fee"&&territoryFeeId&&event.type==="payment.succeeded"){
     const checkoutId=event.data.checkout_configuration_id;
     const accountId=event.data.account_id;
     const paidCents=paidUsdCents(event.data.total);
     if(!paymentId||typeof checkoutId!=="string"||typeof accountId!=="string"||paidCents===null)throw new Error("Incomplete territory payment event");
     const updated=await client.query(
      `UPDATE territory_fees f SET status='paid',provider_payment_id=$1,paid_at=now(),updated_at=now()
       FROM organizers o WHERE f.id=$2 AND f.organizer_id=o.id AND f.status='open'
       AND f.provider_checkout_id=$3 AND o.whop_account_id=$4 AND f.amount_cents<=$5`,
      [paymentId,territoryFeeId,checkoutId,accountId,paidCents],
     );
     if(updated.rowCount===0){
      const existing=await client.query<{provider_payment_id:string|null}>("SELECT provider_payment_id FROM territory_fees WHERE id=$1",[territoryFeeId]);
      if(existing.rows[0]?.provider_payment_id!==paymentId)throw new Error("Territory payment does not match its checkout, account, or amount");
     }
    }
   }

   if(event.type==="refund.created"||event.type==="refund.updated"){
    const paymentId=
     typeof event.data.payment_id==="string"
      ?event.data.payment_id
      :null;
    const status=
     typeof event.data.status==="string"
      ?event.data.status
      :null;

    if(paymentId&&status==="succeeded"){
     await client.query(
      "UPDATE registrations SET status='refunded' WHERE provider_payment_id=$1",
      [paymentId]
     );
     await client.query(
      "UPDATE territory_fees SET status='refund_review',updated_at=now() WHERE provider_payment_id=$1 AND status='paid'",
      [paymentId]
     );
    }
   }

   await client.query(
    "UPDATE webhook_events SET processed_at=now() WHERE id=$1",
    [deliveryId]
   );

   return "applied";
  });

  return NextResponse.json({received:true,outcome});
 }catch(error){
  console.error("whop_webhook_processing_failed",error);
  return NextResponse.json({error:"processing failed"},{status:500});
 }
}
