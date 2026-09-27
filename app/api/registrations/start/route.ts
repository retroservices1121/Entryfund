import { NextRequest,NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cleanText,email as validateEmail,ValidationError } from "@/lib/validation";
import { createRegistrationCheckout } from "@/lib/whop";
import { env } from "@/lib/env";

export async function POST(request:NextRequest){
 try{
  const body=await request.json();
  const collectionId=cleanText(body.collectionId,"Collection ID",80);
  const first=cleanText(body.firstName,"First name",80);
  const last=cleanText(body.lastName,"Last name",80);
  const email=validateEmail(body.email);
  const phone=typeof body.phone==="string"?body.phone.trim().slice(0,40):"";
  const division=typeof body.division==="string"?body.division.trim().slice(0,80):"";
  const partnerName=typeof body.partnerName==="string"?body.partnerName.trim().slice(0,120):"";

  const lookup=await query(
   `SELECT c.*,o.whop_account_id,o.id AS organizer_id
    FROM collections c JOIN organizers o ON o.id=c.organizer_id
    WHERE c.id=$1 AND c.status='open' LIMIT 1`,
   [collectionId]
  );
  const collection=lookup.rows[0];
  if(!collection)return NextResponse.json({error:"Registration is not available"},{status:404});
  if(!collection.whop_account_id)return NextResponse.json({error:"Organizer financial account is not active"},{status:409});

  const count=await query("SELECT COUNT(*)::int AS count FROM registrations WHERE collection_id=$1 AND status IN ('pending','completed','available')",[collectionId]);
  if(collection.capacity&&Number(count.rows[0].count)>=Number(collection.capacity))return NextResponse.json({error:"This collection is full"},{status:409});

  const created=await query(
   `INSERT INTO registrations(collection_id,participant_name,email,phone,metadata,amount_cents,status)
    VALUES($1,$2,$3,$4,$5::jsonb,$6,'pending') RETURNING *`,
   [collectionId,`${first} ${last}`,email,phone,JSON.stringify({division,partner_name:partnerName}),Number(collection.entry_fee_cents)]
  );
  const registration=created.rows[0];

  try{
   const checkout=await createRegistrationCheckout({
    connectedCompanyId:collection.whop_account_id,
    registrationId:registration.id,
    collectionId:collection.id,
    organizerId:collection.organizer_id,
    collectionName:collection.name,
    amountCents:Number(collection.entry_fee_cents),
    redirectUrl:`${env.appUrl}/events/${collection.slug}?registration=${registration.id}`,
   });
   await query("UPDATE registrations SET provider_checkout_id=$1 WHERE id=$2",[checkout.sessionId,registration.id]);
   return NextResponse.json({registrationId:registration.id,checkoutUrl:checkout.purchaseUrl});
  }catch(error){
   await query("UPDATE registrations SET status='failed' WHERE id=$1",[registration.id]);
   throw error;
  }
 }catch(error){
  if(error instanceof ValidationError)return NextResponse.json({error:error.message},{status:400});
  console.error("registration_checkout_failed",error);
  return NextResponse.json({error:"Unable to start payment"},{status:502});
 }
}
