import Link from "next/link";
import { requirePageSession } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic="force-dynamic";
type Award={id:string;recipient_name:string;reason:string;amount_cents:string;status:string;collection_name:string;created_at:Date};
const money=(cents:string)=>(Number(cents)/100).toLocaleString("en-US",{style:"currency",currency:"USD"});

export default async function PayoutsPage(){
 const session=await requirePageSession();
 const awards=await query<Award>(
  `SELECT a.id,a.recipient_name,a.reason,a.amount_cents,a.status,a.created_at,c.name AS collection_name
   FROM awards a JOIN collections c ON c.id=a.collection_id
   WHERE c.organizer_id=$1 ORDER BY a.created_at DESC`,[session.organizerId]);
 return <div className="app"><aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav">
  <Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link href="/card">Card</Link><Link href="/transactions">Transactions</Link><Link className="active" href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link><Link href="/settings">Settings</Link>
 </nav></aside><main className="main"><div className="topbar"><div><div className="muted small">Organizer awards</div><h1>Winner payouts</h1></div><Link className="btn btn-soft" href="/dashboard">Back to overview</Link></div>
 <section className="table-card"><div className="card-head"><div><strong>Awards ledger</strong><div className="muted small">Only awards recorded for your collections appear here.</div></div></div>
 {awards.rows.length?awards.rows.map(award=><div className="table-row" key={award.id}><div><strong>{award.recipient_name}</strong><div className="muted small">{award.collection_name} · {award.reason}</div></div><div><strong>{money(award.amount_cents)}</strong></div><div><span className="pill">{award.status}</span></div><div className="muted small">{award.created_at.toLocaleDateString()}</div></div>):<div style={{padding:20}} className="muted">No awards have been recorded yet. Payout execution is not available in EntryFund yet.</div>}
 </section></main></div>;
}
