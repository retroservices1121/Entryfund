"use client";
import { useRouter } from "next/navigation";

export default function SignOut(){
 const router=useRouter();
 async function signOut(){
  const response=await fetch("/api/auth/logout",{method:"POST"});
  if(response.ok){router.replace("/login");router.refresh()}
 }
 return <button type="button" className="btn btn-soft" onClick={signOut}>Sign out</button>;
}
