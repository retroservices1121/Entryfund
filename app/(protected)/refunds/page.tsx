import Link from "next/link";
import { requirePageSession } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic="force-dynamic";
type Refund={id:string;participant_name:string;collection_name:string;amount_cents:string;status:string;created_at:Date};
const money=(cents:string)=>(Number(cents)/100).toLocaleString("en-US",{style:"currency",currency:"USD"});

export default async function RefundsPage(){
 const session=await requirePageSession();
 const refunds=await query<Refund>(
  `SELECT f.id,r.participant_name,c.name AS collection_name,f.amount_cents,f.status,f.created_at
   FROM refunds f JOIN registrations r ON r.id=f.registration_id JOIN collections c ON c.id=r.collection_id
   WHERE c.organizer_id=$1 ORDER BY f.created_at DESC`,[session.organizerId]);
 return <div className="app"><aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav">
  <Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link href="/card">Card</Link><Link href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link className="active" href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link><Link href="/settings">Settings</Link>
 </nav></aside><main className="main"><div className="topbar"><div><div className="muted small">Financial operations</div><h1>Refunds</h1></div><Link className="btn btn-soft" href="/dashboard">Back to overview</Link></div>
 <section className="table-card"><div className="card-head"><strong>Recorded refunds</strong></div>
 {refunds.rows.length?refunds.rows.map(refund=><div className="table-row" key={refund.id}><div><strong>{refund.participant_name}</strong><div className="muted small">{refund.collection_name}</div></div><div><strong>{money(refund.amount_cents)}</strong></div><div><span className="pill">{refund.status}</span></div><div className="muted small">{refund.created_at.toLocaleDateString()}</div></div>):<div style={{padding:20}} className="muted">No refunds have been recorded. Refund initiation is not available in EntryFund yet.</div>}
 </section></main></div>;
}
