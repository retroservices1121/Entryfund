import { NextRequest,NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request:NextRequest,{params}:{params:Promise<{slug:string}>}){
 const session=await getSession();
 if(!session)return NextResponse.json({error:"Sign in required"},{status:401});
 const {slug}=await params;
 const organizerId=session.organizerId;
 const collection=await query("SELECT * FROM collections WHERE organizer_id=$1 AND slug=$2 LIMIT 1",[organizerId,slug]);
 if(!collection.rows[0])return NextResponse.json({error:"Collection not found"},{status:404});
 const registrations=await query("SELECT id,participant_name,email,amount_cents,status,created_at FROM registrations WHERE collection_id=$1 ORDER BY created_at DESC",[collection.rows[0].id]);
 return NextResponse.json({collection:collection.rows[0],registrations:registrations.rows});
}
