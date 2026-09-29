import Link from "next/link";
import { requirePageSession } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic="force-dynamic";
type Withdrawal={id:string;amount_cents:string;fee_cents:string;status:string;created_at:Date};
const money=(cents:string)=>(Number(cents)/100).toLocaleString("en-US",{style:"currency",currency:"USD"});

export default async function WithdrawalsPage(){
 const session=await requirePageSession();
 const withdrawals=await query<Withdrawal>(
  "SELECT id,amount_cents,fee_cents,status,created_at FROM withdrawals WHERE organizer_id=$1 ORDER BY created_at DESC",
  [session.organizerId]);
 return <div className="app"><aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav">
  <Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link href="/card">Card</Link><Link href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link className="active" href="/withdrawals">Withdrawals</Link><Link href="/settings">Settings</Link>
 </nav></aside><main className="main"><div className="topbar"><div><div className="muted small">External transfers</div><h1>Withdrawals</h1></div><Link className="btn btn-soft" href="/dashboard">Back to overview</Link></div>
 <section className="table-card"><div className="card-head"><strong>Recorded withdrawals</strong></div>
 {withdrawals.rows.length?withdrawals.rows.map(withdrawal=><div className="table-row" key={withdrawal.id}><div><strong>Bank withdrawal</strong><div className="muted small">Fee: {money(withdrawal.fee_cents)}</div></div><div><strong>{money(withdrawal.amount_cents)}</strong></div><div><span className="pill">{withdrawal.status.replaceAll("_"," ")}</span></div><div className="muted small">{withdrawal.created_at.toLocaleDateString()}</div></div>):<div style={{padding:20}} className="muted">No withdrawals have been recorded. Withdrawal initiation is not available in EntryFund yet.</div>}
 </section></main></div>;
}
