import { cookies } from "next/headers";

export type Session={userId:string;organizerId:string;role:"owner"|"admin"|"finance"};

export async function getSession():Promise<Session|null>{
 const store=await cookies();
 const demo=store.get("entryfund_demo_session")?.value;
 if(process.env.NODE_ENV!=="production"&&demo==="1")return {userId:"user_demo",organizerId:"org_demo",role:"owner"};
 return null;
}

export async function requireSession(){
 const session=await getSession();
 if(!session)throw new Error("UNAUTHENTICATED");
 return session;
}
