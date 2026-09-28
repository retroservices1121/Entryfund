"use client";
import { useState } from "react";

export default function FinancialSetup({organizerId}:{organizerId:string}){
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function start(){
  setBusy(true);setError("");
  try{
   const provision=await fetch("/api/organizers/bootstrap",{method:"POST"});
   const provisionResult=await provision.json();
   if(!provision.ok||provisionResult.provisioningPending){setError(provisionResult.error||"Financial setup is temporarily unavailable. Please try again.");return}
   const response=await fetch(`/api/organizers/${organizerId}/activation-link`,{method:"POST"});
   const result=await response.json();
   if(!response.ok){setError(result.error||"Unable to start financial setup");return}
   window.location.assign(result.url);
  }catch{setError("Unable to start financial setup")}
  finally{setBusy(false)}
 }
 return <div>
  <p className="muted">Whop manages identity and business verification before financial features are available. Open its secure setup to begin or resume that process.</p>
  {error&&<p style={{color:"#b42318"}}>{error}</p>}
  <button type="button" className="btn btn-blue" onClick={start} disabled={busy}>{busy?"Opening setup…":"Open Whop financial setup"}</button>
 </div>;
}
