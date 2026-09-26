import { NextResponse } from "next/server";

export function GET(){
 return NextResponse.json({service:"entryfund",status:"ok",version:"0.2.0"});
}
