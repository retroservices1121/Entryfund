"use client";
import { useState } from "react";

export default function RegistrationForm({collectionId,priceLabel}:{collectionId:string;priceLabel:string}){
 const [busy,setBusy]=useState(false);const [error,setError]=useState("");
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");
  const data=new FormData(e.currentTarget);
  const response=await fetch("/api/registrations/start",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
   collectionId,firstName:data.get("firstName"),lastName:data.get("lastName"),email:data.get("email"),phone:data.get("phone"),division:data.get("division"),partnerName:data.get("partnerName")
  })});
  const json=await response.json();
  if(!response.ok){setBusy(false);setError(json.error||"Unable to start checkout");return}
  window.location.assign(json.checkoutUrl);
 }
 return <form className="checkout" onSubmit={submit}>
  <h2 style={{marginTop:0}}>Register</h2>
  <div className="two"><div className="field"><label>First name</label><input name="firstName" required/></div><div className="field"><label>Last name</label><input name="lastName" required/></div></div>
  <div className="field"><label>Email</label><input name="email" type="email" required/></div>
  <div className="field"><label>Phone</label><input name="phone"/></div>
  <div className="two"><div className="field"><label>Division</label><select name="division"><option>Open</option><option>Competitive</option><option>Social</option></select></div><div className="field"><label>Partner name</label><input name="partnerName" placeholder="Optional"/></div></div>
  {error&&<p style={{color:"#b42318"}}>{error}</p>}
  <button className="btn btn-blue" style={{width:"100%"}} disabled={busy}>{busy?"Opening secure checkout…":`Continue to payment · ${priceLabel}`}</button>
  <div className="footer-note">Secure payment is processed by Whop. No EntryFund participant account is required.</div>
 </form>
}