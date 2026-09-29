"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CardAction(){
 const router=useRouter();
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function requestCard(){
  setBusy(true);setError("");
  try{
   const response=await fetch("/api/cards",{method:"POST"});
   const body=await response.json();
   if(!response.ok){setError(body.error||"Whop could not start card setup.");return}
   router.refresh();
  }catch{setError("Whop could not start card setup.")}
  finally{setBusy(false)}
 }
 return <div><button type="button" className="btn btn-blue" disabled={busy} onClick={requestCard}>{busy?"Contacting Whop…":"Continue with Whop Cards"}</button>{error&&<p style={{color:"#b42318"}}>{error}</p>}</div>;
}
