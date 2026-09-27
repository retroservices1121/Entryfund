"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CollectionForm(){
 const router=useRouter();const [error,setError]=useState("");const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  setBusy(true);setError("");const data=new FormData(e.currentTarget);
  const dollars=Number(data.get("fee"));const capacity=Number(data.get("capacity"));
  const res=await fetch("/api/collections",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:data.get("name"),type:data.get("type"),eventDate:data.get("date"),entryFeeCents:Math.round(dollars*100),capacity})});
  const json=await res.json();setBusy(false);
  if(!res.ok){setError(json.error||"Unable to create collection");return}
  router.push("/dashboard");
 }
 return <form className="form-card" onSubmit={submit}>
  <div className="field"><label>Collection name</label><input name="name" required placeholder="Virginia Beach Cornhole Open"/></div>
  <div className="two"><div className="field"><label>Collection type</label><select name="type" defaultValue="tournament"><option value="tournament">Tournament registration</option><option value="league">League fees</option><option value="tryout">Tryout fees</option><option value="team">Team dues</option><option value="other">Other</option></select></div><div className="field"><label>Event date</label><input name="date" type="date"/></div></div>
  <div className="two"><div className="field"><label>Entry fee</label><input name="fee" type="number" min="0.01" step="0.01" required placeholder="50.00"/></div><div className="field"><label>Capacity</label><input name="capacity" type="number" min="1" required placeholder="128"/></div></div>
  {error&&<p style={{color:"#b42318"}}>{error}</p>}
  <button className="btn btn-blue" style={{width:"100%"}} disabled={busy}>{busy?"Creating collection…":"Create registration collection"}</button>
 </form>
}
