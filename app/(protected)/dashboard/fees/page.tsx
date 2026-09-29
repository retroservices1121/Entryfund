import Link from "next/link";
import { requirePageSession } from "@/lib/auth";
import { query } from "@/lib/db";
import OneTimeFeeForm from "./OneTimeFeeForm";

export const dynamic="force-dynamic";
type Fee={id:string;title:string;contact_email:string|null;amount_cents:string;status:string;created_at:Date};
const money=(cents:number)=>(cents/100).toLocaleString("en-US",{style:"currency",currency:"USD"});

export default async function OneTimeFeesPage(){
 const session=await requirePageSession();
 const fees=await query<Fee>("SELECT id,title,contact_email,amount_cents,status,created_at FROM one_time_fees WHERE organizer_id=$1 ORDER BY created_at DESC",[session.organizerId]);
 return <div className="app">
  <aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav"><Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link className="active" href="/dashboard/fees">One-time fees</Link><Link href="/card">Card</Link><Link href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link><Link href="/settings">Settings</Link></nav></aside>
  <main className="main">
   <div className="topbar"><div><div className="muted small">Payment links</div><h1>One-time fees</h1></div><Link className="btn btn-soft" href="/dashboard">Back to dashboard</Link></div>
   <div className="dashboard-grid">
    <section className="table-card"><div className="card-head"><strong>Fees</strong><span className="muted small">{fees.rows.length} total</span></div>
     {fees.rows.length===0?<div style={{padding:20}} className="muted">No one-time fees yet.</div>:fees.rows.map(fee=><div className="activity-row" style={{padding:"18px 20px"}} key={fee.id}>
      <div><strong>{fee.title}</strong><div className="muted small">{fee.contact_email?`${fee.contact_email} · `:""}{money(Number(fee.amount_cents))}</div><div className="muted small">{fee.created_at.toLocaleDateString()}</div></div>
      <div style={{display:"grid",gap:8,justifyItems:"end"}}><span className="pill">{fee.status.replace("_"," ")}</span><Link className="small" href={`/pay/fee/${fee.id}`}>{fee.status==="open"?"Open payment link":"View payment"}</Link></div>
     </div>)}
    </section>
    {session.role==="finance"?<section className="form-card"><h2>View only</h2><p className="muted">An organizer owner or admin can create one-time fees.</p></section>:<OneTimeFeeForm/>}
   </div>
  </main>
 </div>;
}
