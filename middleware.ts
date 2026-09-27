import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request:NextRequest){
 const protectedPaths=["/dashboard","/events/new","/card","/transactions","/payouts","/refunds","/withdrawals","/settings"];
 if(protectedPaths.some(path=>request.nextUrl.pathname===path||request.nextUrl.pathname.startsWith(path+"/"))&&!request.cookies.get("entryfund_session")?.value){
  return NextResponse.redirect(new URL("/login",request.url));
 }
 const response=NextResponse.next();
 response.headers.set("X-Content-Type-Options","nosniff");
 response.headers.set("Referrer-Policy","strict-origin-when-cross-origin");
 response.headers.set("Permissions-Policy","camera=(), microphone=(), geolocation=()");
 response.headers.set("X-Frame-Options","DENY");
 if(request.nextUrl.protocol==="https:")response.headers.set("Strict-Transport-Security","max-age=31536000; includeSubDomains");
 return response;
}

export const config={matcher:"/((?!_next/static|_next/image|favicon.ico).*)"};
