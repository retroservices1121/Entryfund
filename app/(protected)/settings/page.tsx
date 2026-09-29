import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageSession } from "@/lib/auth";
import { query } from "@/lib/db";
import FinancialSetup from "./FinancialSetup";

export const dynamic="force-dynamic";

export default async function SettingsPage(){
 const session=await requirePageSession();
 const result=await query<{name:string;email:string}>("SELECT name,email FROM organizers WHERE id=$1",[session.organizerId]);
 const organizer=result.rows[0];if(!organizer)notFound();
 return <div className="app">
  <aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav"><Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link href="/dashboard/fees">One-time fees</Link><Link href="/card">Card</Link><Link href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link><Link className="active" href="/settings">Settings</Link></nav></aside>
  <main className="main">
   <div className="topbar"><div><div className="muted small">{organizer.name}</div><h1>Account & financial setup</h1></div></div>
   <div className="dashboard-grid">
    <section className="form-card"><div className="eyebrow">Organizer</div><h2>Profile</h2><div className="field"><label>Name</label><input value={organizer.name} readOnly/></div><div className="field"><label>Email</label><input value={organizer.email} readOnly/></div></section>
    <section className="form-card"><div className="eyebrow">Financial access</div><h2>Whop setup</h2>{session.role==="finance"?<p className="muted">An organizer owner or admin can open financial setup.</p>:<FinancialSetup organizerId={session.organizerId}/>}</section>
   </div>
  </main>
 </div>
}
