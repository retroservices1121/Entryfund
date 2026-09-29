"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OneTimeFeeForm(){
 const router=useRouter();
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  const form=event.currentTarget;
  const data=new FormData(form);
  try{
   const amountCents=Math.round(Number(data.get("amount"))*100);
   const response=await fetch("/api/one-time-fees",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
    title:data.get("title"),contactEmail:data.get("contactEmail"),amountCents,
   })});
   const result=await response.json();
   if(!response.ok){setError(result.error||"Unable to create one-time fee");return}
   form.reset();router.refresh();
  }catch{setError("Unable to create one-time fee")}
  finally{setBusy(false)}
 }
 return <form className="form-card" onSubmit={submit}>
  <div className="eyebrow">New one-time fee</div><h2 style={{marginTop:8}}>Create a payment link</h2>
  <div className="field"><label htmlFor="title">Fee name</label><input id="title" name="title" maxLength={120} required placeholder="League dues"/></div>
  <div className="field"><label htmlFor="contactEmail">Contact email (optional)</label><input id="contactEmail" name="contactEmail" type="email" placeholder="contact@example.com"/><span className="muted small">For your records. The link can be shared with anyone; EntryFund does not email it.</span></div>
  <div className="field"><label htmlFor="amount">One-time fee (USD)</label><input id="amount" name="amount" type="number" min="0.01" max="1000000" step="0.01" required placeholder="50.00"/></div>
  {error&&<p style={{color:"#b42318"}}>{error}</p>}
  <button className="btn btn-blue" disabled={busy}>{busy?"Creating…":"Create one-time fee"}</button>
 </form>;
}
