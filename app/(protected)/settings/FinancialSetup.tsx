"use client";
import { useState } from "react";

export default function FinancialSetup({organizerId}:{organizerId:string}){
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [message,setMessage]=useState("");
 const [kind,setKind]=useState<"individual"|"business">("individual");
 async function start(){
  setBusy(true);setError("");setMessage("");
  try{
   const provision=await fetch("/api/organizers/bootstrap",{method:"POST"});
   const provisionResult=await provision.json();
   if(!provision.ok||provisionResult.provisioningPending){setError(provisionResult.error||"Financial setup is temporarily unavailable. Please try again.");return}
   const response=await fetch(`/api/organizers/${organizerId}/activation-link`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({kind})});
   const result=await response.json();
   if(!response.ok){setError(`${result.error||"Unable to start verification"}${result.requestId?` (Whop request ${result.requestId})`:""}`);return}
   if(result.url){window.location.assign(result.url);return}
   const status=result.status;
   setMessage(status==="approved"?"Whop has already approved this verification. Card eligibility is reviewed separately.":
    status==="processing"||status==="manual_review"?"Whop is reviewing your verification. Check back here after its status changes.":
    status==="action_required"?`Whop needs more information: ${(result.requestedInformation||[]).join("; ")||"contact Whop support for the requested items"}.`:
    "Whop did not provide a verification link. Please contact Whop support and ask about this account's verification status.");
  }catch{setError("Unable to start verification. Please try again.")}
  finally{setBusy(false)}
 }
 return <div>
  <p className="muted">Whop handles identity verification. Choose how you operate, then open its secure verification form.</p>
  <div className="field"><label htmlFor="verification-kind">Verify as</label><select id="verification-kind" value={kind} onChange={event=>setKind(event.target.value as "individual"|"business")} disabled={busy}><option value="individual">An individual</option><option value="business">A registered business</option></select></div>
  {error&&<p style={{color:"#b42318"}}>{error}</p>}
  {message&&<p className="muted">{message}</p>}
  <button type="button" className="btn btn-blue" onClick={start} disabled={busy}>{busy?"Opening verification...":"Open Whop verification"}</button>
 </div>;
}
