import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage(){
 if(await getSession())redirect("/dashboard");
 return <main className="shell"><nav className="nav"><Link className="brand" href="/">Entry<span className="brand-accent">Fund</span></Link></nav>
  <div className="form-wrap"><div className="eyebrow">Organizer account</div><h1>Sign in to EntryFund</h1><p className="muted">Access your collections and financial records.</p><LoginForm/>
   <p className="muted small">Have an invitation? <Link href="/onboarding">Create your account</Link></p>
  </div></main>;
}
