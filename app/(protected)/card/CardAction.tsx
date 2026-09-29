"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CardAction({phase}:{phase:"application"|"issue"}){
 const router=useRouter();
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [hostedUrl,setHostedUrl]=useState("");
 async function requestCard(){
  setBusy(true);setError("");setMessage("");setHostedUrl("");
  try{
   const response=await fetch("/api/cards",{method:"POST"});
   const body=await response.json();
   if(!response.ok){setError(body.error||"Whop could not start card setup.");return}
   if(body.object==="card_application")setMessage("Your card application was submitted to Whop. Refresh this page for its status.");
   else if(body.object==="card")setMessage("Your virtual card was issued. Its status will appear below.");
   else setMessage("Whop received the request. Refresh this page for its status.");
   if(typeof body.hostedUrl==="string"&&body.hostedUrl.startsWith("https://"))setHostedUrl(body.hostedUrl);
   router.refresh();
  }catch{setError("Whop could not start card setup.")}
  finally{setBusy(false)}
 }
 return <div><button type="button" className="btn btn-blue" disabled={busy} onClick={requestCard}>{busy?"Contacting Whop...":phase==="issue"?"Issue virtual card":"Start card application"}</button>{error&&<p style={{color:"#b42318"}}>{error}</p>}{message&&<p className="muted">{message}</p>}{hostedUrl&&<a className="btn btn-soft" href={hostedUrl}>Continue with Whop</a>}</div>;
}
