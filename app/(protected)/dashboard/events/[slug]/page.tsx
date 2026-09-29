import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageSession } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic="force-dynamic";
type Collection={id:string;name:string;slug:string;capacity:number};
type Registration={id:string;participant_name:string;amount_cents:string;status:string;created_at:Date};
type Summary={amount_cents:string};
type Revenue={paid_count:string;amount_cents:string};
const money=(cents:number)=>(cents/100).toLocaleString("en-US",{style:"currency",currency:"USD"});

export default async function EventFinancePage({params}:{params:Promise<{slug:string}>}){
 const session=await requirePageSession();
 const {slug}=await params;
 const result=await query<Collection>("SELECT id,name,slug,capacity FROM collections WHERE organizer_id=$1 AND slug=$2",[session.organizerId,slug]);
 const collection=result.rows[0];if(!collection)notFound();
 const [registrations,revenue,expenses,awards]=await Promise.all([
  query<Registration>("SELECT id,participant_name,amount_cents,status,created_at FROM registrations WHERE collection_id=$1 ORDER BY created_at DESC LIMIT 100",[collection.id]),
  query<Revenue>("SELECT COUNT(*)::bigint AS paid_count,COALESCE(SUM(amount_cents),0)::bigint AS amount_cents FROM registrations WHERE collection_id=$1 AND status='completed'",[collection.id]),
  query<Summary>("SELECT COALESCE(SUM(amount_cents),0)::bigint AS amount_cents FROM expenses WHERE collection_id=$1 AND status='completed'",[collection.id]),
  query<Summary>("SELECT COALESCE(SUM(amount_cents),0)::bigint AS amount_cents FROM awards WHERE collection_id=$1 AND status IN ('ready','processing','completed')",[collection.id]),
 ]);
 const paidCount=Number(revenue.rows[0]?.paid_count||0);
 const collected=Number(revenue.rows[0]?.amount_cents||0);
 return <div className="app"><aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav">
  <Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link href="/card">Card</Link><Link href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link><Link href="/settings">Settings</Link>
 </nav></aside><main className="main"><div className="topbar"><div><div className="muted small">Collection</div><h1>{collection.name}</h1></div><Link className="btn btn-soft" href={`/events/${collection.slug}`}>Public registration</Link></div>
 <section className="cards"><div className="stat"><div className="muted small">Paid registrations</div><div className="value">{paidCount} / {collection.capacity}</div></div><div className="stat"><div className="muted small">Recorded revenue</div><div className="value">{money(collected)}</div></div><div className="stat"><div className="muted small">Recorded expenses</div><div className="value">{money(Number(expenses.rows[0]?.amount_cents||0))}</div></div><div className="stat"><div className="muted small">Recorded awards</div><div className="value">{money(Number(awards.rows[0]?.amount_cents||0))}</div></div></section>
 <section className="table-card"><div className="card-head"><strong>Registrations</strong><span className="muted small">{registrations.rows.length} shown</span></div>
 {registrations.rows.length?registrations.rows.map(row=><div className="table-row" key={row.id}><div><strong>{row.participant_name}</strong></div><div><strong>{money(Number(row.amount_cents))}</strong></div><div><span className="pill">{row.status}</span></div><div className="muted small">{row.created_at.toLocaleDateString()}</div></div>):<div style={{padding:20}} className="muted">No registrations yet.</div>}
 </section><p className="muted small">Collection totals are EntryFund records. See the dashboard for Whop's available and pending balance.</p>
 </main></div>;
}
