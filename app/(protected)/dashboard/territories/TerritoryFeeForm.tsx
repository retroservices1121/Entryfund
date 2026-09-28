"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TerritoryFeeForm(){
 const router=useRouter();
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  const form=event.currentTarget;
  const data=new FormData(form);
  try{
   const response=await fetch("/api/territory-fees",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    territoryName:data.get("territoryName"),operatorEmail:data.get("operatorEmail"),amountCents:Math.round(Number(data.get("amount"))*100),
   })});
   const result=await response.json();
   if(!response.ok){setError(result.error||"Unable to create territory fee");return}
   form.reset();router.refresh();
  }catch{setError("Unable to create territory fee")}
  finally{setBusy(false)}
 }
 return <form className="form-card" onSubmit={submit}>
  <div className="eyebrow">New territory fee</div><h2 style={{marginTop:8}}>Create a payment link</h2>
  <div className="field"><label htmlFor="territoryName">Territory name</label><input id="territoryName" name="territoryName" maxLength={120} required placeholder="Virginia Beach"/></div>
  <div className="field"><label htmlFor="operatorEmail">Operator email</label><input id="operatorEmail" name="operatorEmail" type="email" required placeholder="operator@example.com"/><span className="muted small">For your records. EntryFund does not email the link.</span></div>
  <div className="field"><label htmlFor="amount">One-time fee (USD)</label><input id="amount" name="amount" type="number" min="0.01" max="1000000" step="0.01" required placeholder="500.00"/></div>
  {error&&<p style={{color:"#b42318"}}>{error}</p>}
  <button className="btn btn-blue" disabled={busy}>{busy?"Creating…":"Create territory fee"}</button>
 </form>
}
