import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { env } from "@/lib/env";

export const dynamic="force-dynamic";

export async function GET(){
 const checks:{database:boolean;whop:boolean}={
  database:false,
  whop:Boolean(env.whopApiKey&&env.whopWebhookSecret&&env.whopCompanyId),
 };
 try{await query("SELECT 1");checks.database=true}catch{}
 const ready=checks.database&&checks.whop;
 return NextResponse.json({service:"entryfund",ready,checks},{status:ready?200:503});
}
