import { env } from "./env";

export function sameOrigin(request:Request){
 const origin=request.headers.get("origin");
 if(!origin)return false;
 try{
  const source=new URL(origin).origin;
  if(source===new URL(request.url).origin||source===new URL(env.appUrl).origin)return true;
  // Railway terminates HTTPS before Next.js, so request.url can carry an
  // internal hostname. Browsers send the public host in the Host header.
  const sourceUrl=new URL(source);
  return [request.headers.get("host"),request.headers.get("x-forwarded-host")]
   .some(host=>host!==null&&!/[,/\\\s]/.test(host)&&sourceUrl.host===host.toLowerCase());
 }catch{return false}
}
