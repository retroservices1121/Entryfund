"use client";
import { useEffect,useState } from "react";

type Details={number:string;cvc:string;expiryMonth:string|null;expiryYear:string|null};

export default function CardDetails({cardId,last4}:{cardId:string;last4:string|null}){
 const [details,setDetails]=useState<Details|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");

 useEffect(()=>{
  if(!details)return;
  const timer=setTimeout(()=>setDetails(null),30_000);
  const hide=()=>{if(document.hidden)setDetails(null)};
  document.addEventListener("visibilitychange",hide);
  return ()=>{clearTimeout(timer);document.removeEventListener("visibilitychange",hide)};
 },[details]);

 async function reveal(){
  setBusy(true);setError("");
  try{
   const response=await fetch(`/api/cards/${encodeURIComponent(cardId)}`,{cache:"no-store"});
   const body=await response.json();
   if(!response.ok){setError(body.error||"Card details are unavailable");return}
   setDetails(body as Details);
  }catch{setError("Card details are unavailable")}
  finally{setBusy(false)}
 }

 return <div style={{display:"grid",gap:8,justifyItems:"start"}}>
  {details?<>
   <div><strong>{details.number.replace(/(.{4})/g,"$1 ").trim()}</strong></div>
   <div className="small">Expires {details.expiryMonth??"--"}/{details.expiryYear??"--"} · CVC {details.cvc}</div>
   <button type="button" className="btn btn-soft" onClick={()=>setDetails(null)}>Hide card</button>
  </>:<button type="button" className="btn btn-soft" disabled={busy} onClick={reveal}>{busy?"Loading...":`View card ${last4?`•••• ${last4}`:""}`}</button>}
  {error&&<span className="small" style={{color:"#b42318"}}>{error}</span>}
 </div>;
}
