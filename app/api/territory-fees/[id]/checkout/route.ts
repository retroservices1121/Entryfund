import { NextRequest,NextResponse } from "next/server";
import { query } from "@/lib/db";
import { env } from "@/lib/env";
import { sameOrigin } from "@/lib/request-security";
import { createTerritoryFeeCheckout } from "@/lib/whop";

type Fee={id:string;territory_name:string;amount_cents:string;status:string;whop_account_id:string|null;provider_checkout_id:string|null;checkout_url:string|null};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin"},{status:403});
 const {id}=await params;
 if(!uuid.test(id))return NextResponse.json({error:"Territory fee not found"},{status:404});
 try{
  const result=await query<Fee>(
   `SELECT f.id,f.territory_name,f.amount_cents,f.status,f.provider_checkout_id,f.checkout_url,o.whop_account_id
    FROM territory_fees f JOIN organizers o ON o.id=f.organizer_id WHERE f.id=$1`,[id],
  );
  const fee=result.rows[0];
  if(!fee)return NextResponse.json({error:"Territory fee not found"},{status:404});
  if(fee.status!=="open")return NextResponse.json({error:"This territory fee is no longer payable"},{status:409});
  if(!fee.whop_account_id)return NextResponse.json({error:"Organizer financial account is not active"},{status:409});
  if(fee.checkout_url)return NextResponse.json({checkoutUrl:fee.checkout_url});
  const checkout=await createTerritoryFeeCheckout({
   connectedCompanyId:fee.whop_account_id,
   territoryFeeId:fee.id,
   territoryName:fee.territory_name,
   amountCents:Number(fee.amount_cents),
   redirectUrl:`${env.appUrl}/pay/territory/${fee.id}?returned=1`,
  });
  const saved=await query<{checkout_url:string}>(
   `UPDATE territory_fees SET provider_checkout_id=$1,checkout_url=$2,updated_at=now()
    WHERE id=$3 AND status='open' AND provider_checkout_id IS NULL RETURNING checkout_url`,
   [checkout.sessionId,checkout.purchaseUrl,id],
  );
  if(saved.rows[0])return NextResponse.json({checkoutUrl:saved.rows[0].checkout_url});
  const current=await query<{status:string;checkout_url:string|null}>("SELECT status,checkout_url FROM territory_fees WHERE id=$1",[id]);
  if(current.rows[0]?.status==="open"&&current.rows[0].checkout_url)return NextResponse.json({checkoutUrl:current.rows[0].checkout_url});
  return NextResponse.json({error:"This territory fee is no longer payable"},{status:409});
 }catch(error){
  console.error("territory_fee_checkout_failed",error);
  return NextResponse.json({error:"Unable to start territory payment"},{status:502});
 }
}
