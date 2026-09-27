import { env } from "./env";

export function sameOrigin(request:Request){
 const origin=request.headers.get("origin");
 if(!origin)return false;
 try{
  const source=new URL(origin).origin;
  return source===new URL(request.url).origin||source===new URL(env.appUrl).origin;
 }catch{return false}
}
