import { NextRequest,NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request:NextRequest,{params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const organizerId=request.nextUrl.searchParams.get("organizerId");
 if(!organizerId)return NextResponse.json({error:"organizerId is required"},{status:400});
 const collection=await query("SELECT * FROM collections WHERE organizer_id=$1 AND slug=$2 LIMIT 1",[organizerId,slug]);
 if(!collection.rows[0])return NextResponse.json({error:"Collection not found"},{status:404});
 const registrations=await query("SELECT id,participant_name,email,amount_cents,status,created_at FROM registrations WHERE collection_id=$1 ORDER BY created_at DESC",[collection.rows[0].id]);
 return NextResponse.json({collection:collection.rows[0],registrations:registrations.rows});
}
