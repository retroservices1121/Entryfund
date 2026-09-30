import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { whop } from "@/lib/whop";

export const dynamic="force-dynamic";
const noStore={"Cache-Control":"private, no-store, max-age=0"};

export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const session=await getSession();
 if(!session)return NextResponse.json({error:"Sign in required"},{status:401,headers:noStore});
 if(session.role!=="owner")return NextResponse.json({error:"Organizer owner access required"},{status:403,headers:noStore});
 const {id}=await params;
 if(!/^icrd_[A-Za-z0-9_-]{4,80}$/.test(id))return NextResponse.json({error:"Invalid card"},{status:400,headers:noStore});
 const result=await query<{whop_account_id:string|null}>("SELECT whop_account_id FROM organizers WHERE id=$1",[session.organizerId]);
 const accountId=result.rows[0]?.whop_account_id;
 if(!accountId)return NextResponse.json({error:"Whop account unavailable"},{status:404,headers:noStore});
 try{
  const cards=await whop().cards.list({account_id:accountId});
  if(!cards.data.some(card=>card.id===id&&card.status==="active"))return NextResponse.json({error:"Active card not found"},{status:404,headers:noStore});
  const card=await whop().cards.retrieve({id,account_id:accountId});
  if(card.id!==id||card.status!=="active"||!card.secrets?.card_number||!card.secrets.cvc)
   return NextResponse.json({error:"Card details are unavailable"},{status:404,headers:noStore});
  return NextResponse.json({number:card.secrets.card_number,cvc:card.secrets.cvc,
   expiryMonth:card.expiration_month,expiryYear:card.expiration_year},{headers:noStore});
 }catch(error){
  const provider=error&&typeof error==="object"?error as {statusCode?:unknown;requestId?:unknown}:{};
  console.error("card_details_read_failed",{organizerId:session.organizerId,cardId:id,
   statusCode:provider.statusCode,requestId:provider.requestId});
  return NextResponse.json({error:"Card details are unavailable"},{status:502,headers:noStore});
 }
}
