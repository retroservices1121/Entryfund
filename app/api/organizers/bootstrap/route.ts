import { NextRequest,NextResponse } from "next/server";
import { query,transaction } from "@/lib/db";
import { cleanText,email as validateEmail,ValidationError } from "@/lib/validation";

export async function POST(request:NextRequest){
 try{
  const body=await request.json();
  const name=cleanText(body.name,"Organizer name",120);
  const email=validateEmail(body.email);
  const organizer=await transaction(async client=>{
   const existing=await client.query("SELECT * FROM organizers WHERE email=$1 LIMIT 1",[email]);
   if(existing.rows[0])return existing.rows[0];
   const created=await client.query("INSERT INTO organizers(name,email) VALUES($1,$2) RETURNING *",[name,email]);
   return created.rows[0];
  });
  return NextResponse.json({organizer},{status:201});
 }catch(error){
  if(error instanceof ValidationError)return NextResponse.json({error:error.message},{status:400});
  console.error(error);return NextResponse.json({error:"Unable to create organizer"},{status:500});
 }
}
