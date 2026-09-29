import Link from "next/link";
import { query } from "@/lib/db";
import { requirePageSession } from "@/lib/auth";
import SignOut from "../SignOut";
import { formatUsd, getOrganizerWallet } from "@/lib/wallet";

const money=(cents:number)=>Number(cents).toLocaleString("en-US",{style:"currency",currency:"USD",minimumFractionDigits:2});
export const dynamic="force-dynamic";

export default async function Dashboard(){
 const session=await requirePageSession();
 const organizerId=session.organizerId;
 let organizer:any=null;let collections:any[]=[];let totals={collected:0,spent:0,withdrawn:0};
 if(organizerId){
  const [org,cols,revenue,feeRevenue,expenses,withdrawals]=await Promise.all([
   query("SELECT * FROM organizers WHERE id=$1 LIMIT 1",[organizerId]),
   query("SELECT c.*,COALESCE((SELECT COUNT(*) FROM registrations r WHERE r.collection_id=c.id AND r.status='completed'),0)::int AS paid,COALESCE((SELECT SUM(amount_cents) FROM registrations r WHERE r.collection_id=c.id AND r.status='completed'),0)::bigint AS collected FROM collections c WHERE c.organizer_id=$1 ORDER BY c.event_date DESC NULLS LAST",[organizerId]),
   query("SELECT COALESCE(SUM(r.amount_cents),0)::bigint AS total FROM registrations r JOIN collections c ON c.id=r.collection_id WHERE c.organizer_id=$1 AND r.status='completed'",[organizerId]),
   query("SELECT COALESCE(SUM(amount_cents),0)::bigint AS total FROM one_time_fees WHERE organizer_id=$1 AND status='paid'",[organizerId]),
   query("SELECT COALESCE(SUM(amount_cents),0)::bigint AS total FROM expenses WHERE organizer_id=$1 AND status='completed'",[organizerId]),
   query("SELECT COALESCE(SUM(amount_cents+fee_cents),0)::bigint AS total FROM withdrawals WHERE organizer_id=$1 AND status='completed'",[organizerId])
  ]);
  organizer=org.rows[0]??null;collections=cols.rows;
  totals={collected:Number(revenue.rows[0]?.total||0)+Number(feeRevenue.rows[0]?.total||0),spent:Number(expenses.rows[0]?.total||0),withdrawn:Number(withdrawals.rows[0]?.total||0)};
 }
 let wallet:Awaited<ReturnType<typeof getOrganizerWallet>>|null=null;
 if(organizer?.whop_account_id){
  try{wallet=await getOrganizerWallet(organizer.whop_account_id)}
  catch(error){console.error("dashboard_wallet_read_failed",{organizerId,error})}
 }
 return <div className="app">
  <aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav"><Link className="active" href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link href="/dashboard/fees">One-time fees</Link><Link href="/card">Card</Link><Link href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link><Link href="/settings">Settings</Link></nav></aside>
  <main className="main">
   {!organizer?<div className="form-card" style={{maxWidth:650}}><div className="eyebrow">Organizer account</div><h1>Workspace unavailable</h1><p className="muted">Your account could not be loaded.</p><SignOut/></div>:<>
   <div className="topbar"><div><div className="muted small">Organizer</div><h1>{organizer.name}</h1></div><div style={{display:"flex",gap:10}}><SignOut/><Link className="btn btn-soft" href="/dashboard/fees">One-time fees</Link><Link className="btn btn-blue" href="/events/new">+ Create collection</Link></div></div>
   <section className="cards"><div className="stat"><div className="muted small">Recorded payments</div><div className="value">{money(totals.collected/100)}</div></div><div className="stat"><div className="muted small">Whop available (USD)</div><div className="value">{wallet?.balance?formatUsd(wallet.balance.available):"Unavailable"}</div></div><div className="stat"><div className="muted small">Whop pending (USD)</div><div className="value">{wallet?.balance?formatUsd(wallet.balance.pending):"Unavailable"}</div></div><div className="stat"><div className="muted small">Whop reserve (USD)</div><div className="value">{wallet?.balance?formatUsd(wallet.balance.reserve):"Unavailable"}</div></div></section>
   {!wallet?.balance&&<p className="muted small">Whop balance is unavailable for this account. Check financial setup and the API key's balance access.</p>}
   <section className="table-card"><div className="card-head"><strong>Collections</strong><Link className="small" href="/events/new">New collection</Link></div>
    {collections.length===0?<div style={{padding:24}} className="muted">No collections yet. Create your first one.</div>:collections.map(c=><Link className="table-row" href={"/dashboard/events/"+c.slug+"?organizer="+organizerId} key={c.id}><div><strong>{c.name}</strong><div className="muted small">{c.event_date?new Date(c.event_date).toLocaleDateString():"No date"}</div></div><div><strong>{c.paid}/{c.capacity}</strong><div className="muted small">paid</div></div><div><strong>{money(Number(c.collected)/100)}</strong><div className="muted small">collected</div></div><div><span className="pill">{c.status}</span></div></Link>)}
   </section></>}
  </main>
 </div>
}
