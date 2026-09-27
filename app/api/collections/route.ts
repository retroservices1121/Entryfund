import { NextRequest,NextResponse } from "next/server";
import { query } from "@/lib/db";
import { cleanText,positiveCents,slug as validateSlug,ValidationError } from "@/lib/validation";
import { getSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/request-security";

function makeSlug(name:string){return name.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)}

export async function POST(request:NextRequest){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin"},{status:403});
 const session=await getSession();
 if(!session)return NextResponse.json({error:"Sign in required"},{status:401});
 if(session.role==="finance")return NextResponse.json({error:"Owner access required"},{status:403});
 try{
  const body=await request.json();
  const organizerId=session.organizerId;
  const name=cleanText(body.name,"Collection name",120);
  const slug=validateSlug(body.slug||makeSlug(name));
  const type=["tournament","league","tryout","team","other"].includes(body.type)?body.type:"other";
  const entryFeeCents=positiveCents(body.entryFeeCents,"Entry fee");
  const capacity=Number(body.capacity);
  if(!Number.isInteger(capacity)||capacity<1||capacity>100000)throw new ValidationError("Capacity is invalid");
  const result=await query(
   `INSERT INTO collections(organizer_id,slug,name,type,event_date,entry_fee_cents,capacity,status)
    VALUES($1,$2,$3,$4,$5,$6,$7,'open') RETURNING *`,
   [organizerId,slug,name,type,body.eventDate||null,entryFeeCents,capacity]
  );
  return NextResponse.json({collection:result.rows[0]},{status:201});
 }catch(error){
  if(error instanceof ValidationError)return NextResponse.json({error:error.message},{status:400});
  console.error(error);return NextResponse.json({error:"Unable to create collection"},{status:500});
 }
}
