"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm(){
 const router=useRouter();
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  try{
   const data=new FormData(event.currentTarget);
   const response=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:data.get("email"),password:data.get("password")})});
   const result=await response.json();
   if(!response.ok){setError(result.error||"Unable to sign in");return}
   router.replace("/dashboard");router.refresh();
  }catch{setError("Unable to sign in right now")}
  finally{setBusy(false)}
 }
 return <form className="form-card" onSubmit={submit}>
  <div className="field"><label>Email</label><input name="email" type="email" required autoComplete="email"/></div>
  <div className="field"><label>Password</label><input name="password" type="password" required autoComplete="current-password"/></div>
  {error&&<p style={{color:"#b42318"}} role="alert">{error}</p>}
  <button className="btn btn-blue" disabled={busy}>{busy?"Signing in…":"Sign in"}</button>
 </form>;
}
