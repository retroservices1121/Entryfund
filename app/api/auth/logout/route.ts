import { NextResponse } from "next/server";
import { revokeSession,sessionCookie } from "@/lib/auth";
import { sameOrigin } from "@/lib/request-security";

export async function POST(request:Request){
 if(!sameOrigin(request))return NextResponse.json({error:"Invalid request origin"},{status:403});
 await revokeSession();
 const response=NextResponse.json({ok:true});
 response.cookies.set({name:sessionCookie,value:"",path:"/",maxAge:0});
 return response;
}
