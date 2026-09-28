import Link from "next/link";
import { requirePageSession } from "@/lib/auth";
import { query } from "@/lib/db";
import TerritoryFeeForm from "./TerritoryFeeForm";

export const dynamic="force-dynamic";
type Fee={id:string;territory_name:string;operator_email:string;amount_cents:string;status:string;created_at:Date};
const money=(cents:number)=>(cents/100).toLocaleString("en-US",{style:"currency",currency:"USD"});

export default async function TerritoryFeesPage(){
 const session=await requirePageSession();
 const fees=await query<Fee>("SELECT id,territory_name,operator_email,amount_cents,status,created_at FROM territory_fees WHERE organizer_id=$1 ORDER BY created_at DESC",[session.organizerId]);
 return <div className="app">
  <aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav"><Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link className="active" href="/dashboard/territories">Territory fees</Link><Link href="/settings">Settings</Link></nav></aside>
  <main className="main">
   <div className="topbar"><div><div className="muted small">One-time payments</div><h1>Territory fees</h1></div><Link className="btn btn-soft" href="/dashboard">Back to dashboard</Link></div>
   <div className="dashboard-grid">
    <section className="table-card"><div className="card-head"><strong>Territories</strong><span className="muted small">{fees.rows.length} total</span></div>
     {fees.rows.length===0?<div style={{padding:20}} className="muted">No territory fees yet.</div>:fees.rows.map(fee=><div className="activity-row" style={{padding:"18px 20px"}} key={fee.id}>
      <div><strong>{fee.territory_name}</strong><div className="muted small">{fee.operator_email} · {money(Number(fee.amount_cents))}</div><div className="muted small">{fee.created_at.toLocaleDateString()}</div></div>
      <div style={{display:"grid",gap:8,justifyItems:"end"}}><span className="pill">{fee.status.replace("_"," ")}</span><Link className="small" href={`/pay/territory/${fee.id}`}>{fee.status==="open"?"Open payment link":"View payment"}</Link></div>
     </div>)}
    </section>
    {session.role==="finance"?<section className="form-card"><h2>View only</h2><p className="muted">An organizer owner or admin can create territory fees.</p></section>:<TerritoryFeeForm/>}
   </div>
  </main>
 </div>;
}
