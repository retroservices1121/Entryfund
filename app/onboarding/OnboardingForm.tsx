"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingForm(){
 const router=useRouter();const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");
  const data=new FormData(e.currentTarget);
  const res=await fetch("/api/organizers/bootstrap",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:data.get("name"),email:data.get("email"),password:data.get("password"),invitationCode:data.get("invitationCode")})});
  const json=await res.json();setBusy(false);
  if(!res.ok){setError(json.error||"Unable to create organizer");return}
  router.push("/events/new");
 }
 return <form className="form-card" onSubmit={submit}>
  <div className="field"><label>Organization / organizer name</label><input name="name" required maxLength={120} placeholder="Tidewater Cornhole"/></div>
  <div className="field"><label>Work email</label><input name="email" type="email" required placeholder="you@organization.com"/></div>
  <div className="field"><label>Password</label><input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password"/></div>
  <div className="field"><label>Invitation code</label><input name="invitationCode" type="password" required autoComplete="off"/></div>
  <div className="two"><div className="field"><label>Primary sport</label><select name="sport"><option>Cornhole</option><option>Pickleball</option><option>Flag Football</option><option>Esports</option><option>Fantasy</option><option>Other</option></select></div><div className="field"><label>Organizer type</label><select name="type"><option>Individual organizer</option><option>League</option><option>Club / team</option><option>Company</option><option>Nonprofit</option></select></div></div>
  <div style={{background:"#f4f7f3",padding:16,borderRadius:12,marginBottom:18}}><strong>Verification comes when you access funds.</strong><p className="muted small" style={{marginBottom:0}}>Create collections first. Identity/business verification unlocks financial access.</p></div>
  {error&&<p style={{color:"#b42318"}}>{error}</p>}
  <button className="btn btn-blue" style={{width:"100%"}} disabled={busy}>{busy?"Creating account…":"Continue to first collection"}</button>
 </form>
}
