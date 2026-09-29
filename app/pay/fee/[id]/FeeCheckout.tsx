"use client";
import { useState } from "react";

export default function FeeCheckout({id,amount}:{id:string;amount:string}){
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function pay(){
  setBusy(true);setError("");
  try{
   const response=await fetch(`/api/one-time-fees/${id}/checkout`,{method:"POST"});
   const result=await response.json();
   if(!response.ok){setError(result.error||"Unable to open checkout");return}
   window.location.assign(result.checkoutUrl);
  }catch{setError("Unable to open checkout")}
  finally{setBusy(false)}
 }
 return <div className="checkout">
  <h2 style={{marginTop:0}}>Pay one-time fee</h2>
  <p className="muted">This is a one-time payment. Whop processes the checkout.</p>
  {error&&<p style={{color:"#b42318"}}>{error}</p>}
  <button type="button" className="btn btn-blue" onClick={pay} disabled={busy}>{busy?"Opening checkout…":`Continue to payment · ${amount}`}</button>
 </div>;
}
