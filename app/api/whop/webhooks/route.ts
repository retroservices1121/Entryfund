import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { env } from "@/lib/env";
import { transaction } from "@/lib/db";

type WhopEvent={id:string;type:string;data:Record<string,unknown>};

function metadataOf(data:Record<string,unknown>){
 const value=data.metadata;
 return value&&typeof value==="object"?value as Record<string,unknown>:{};
}

export async function POST(request:Request){
 if(!env.whopWebhookSecret)return NextResponse.json({error:"Webhook secret is not configured"},{status:500});

 const raw=await request.text();
 const headers=Object.fromEntries(request.headers.entries());

 let event:WhopEvent;
 try{
  const verifier=new Webhook(env.whopWebhookSecret,{format:"raw"});\n  event=verifier.verify(raw,headers) as WhopEvent;
 }catch(error){
  console.error("whop_webhook_signature_failed",error);
  return NextResponse.json({error:"bad signature"},{status:401});
 }

 const deliveryId=headers["webhook-id"]??event.id;
 try{
  const outcome=await transaction(async client=>{
   const inserted=await client.query(
    `INSERT INTO webhook_events(id,provider,event_type,payload)
     VALUES($1,'whop',$2,$3::jsonb)
     ON CONFLICT(id) DO NOTHING RETURNING id`,
    [deliveryId,event.type,raw]
   );
   if(inserted.rowCount===0)return "duplicate";

   if(event.type==="payment.succeeded"||event.type==="payment.failed"){
    const metadata=metadataOf(event.data);
    const registrationId=typeof metadata.registration_id==="string"?metadata.registration_id:null;
    const kind=metadata.kind;
    if(kind==="entryfund_registration"&&registrationId){
     const paymentId=typeof event.data.id==="string"?event.data.id:null;
     if(event.type==="payment.succeeded"){
      await client.query(
       `UPDATE registrations
        SET status='completed',provider_payment_id=COALESCE(provider_payment_id,$1)
        WHERE id=$2 AND status IN ('pending','available')`,
       [paymentId,registrationId]
      );
     }else{
      await client.query("UPDATE registrations SET status='failed' WHERE id=$1 AND status='pending'",[registrationId]);
     }
    }
   }

   if(event.type==="refund.created"||event.type==="refund.updated"){
    const paymentId=typeof event.data.payment_id==="string"?event.data.payment_id:null;
    const status=typeof event.data.status==="string"?event.data.status:null;
    if(paymentId&&status==="completed"){
     await client.query("UPDATE registrations SET status='refunded' WHERE provider_payment_id=$1",[paymentId]);
    }
   }

   await client.query("UPDATE webhook_events SET processed_at=now() WHERE id=$1",[deliveryId]);
   return "applied";
  });

  return NextResponse.json({received:true,outcome});
 }catch(error){
  console.error("whop_webhook_processing_failed",error);
  return NextResponse.json({error:"processing failed"},{status:500});
 }
}
