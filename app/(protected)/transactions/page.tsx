import Link from "next/link";
import { requirePageSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { whop } from "@/lib/whop";

export const dynamic="force-dynamic";
type PaymentRow={title:string;amount_cents:string;paid_at:Date;kind:string};
type Activity={id:string;title:string;amount:number;date:Date;status:string};
const money=(dollars:number)=>dollars.toLocaleString("en-US",{style:"currency",currency:"USD"});

export default async function TransactionsPage(){
 const session=await requirePageSession();
 const organizer=await query<{whop_account_id:string|null}>("SELECT whop_account_id FROM organizers WHERE id=$1",[session.organizerId]);
 const payments=await query<PaymentRow>(
  `SELECT title,amount_cents,paid_at,'One-time fee' AS kind FROM one_time_fees
   WHERE organizer_id=$1 AND status='paid' AND paid_at IS NOT NULL
   UNION ALL
   SELECT c.name AS title,r.amount_cents,r.created_at AS paid_at,'Registration' AS kind
   FROM registrations r JOIN collections c ON c.id=r.collection_id
   WHERE c.organizer_id=$1 AND r.status='completed'
   ORDER BY paid_at DESC LIMIT 100`,[session.organizerId]);
 const activity:Activity[]=payments.rows.map((row,index)=>({
  id:`payment-${index}`,title:`${row.kind}: ${row.title}`,amount:Number(row.amount_cents)/100,
  date:new Date(row.paid_at),status:"Paid",
 }));
 let cardAvailable=false;
 const accountId=organizer.rows[0]?.whop_account_id;
 if(accountId){
  try{
   const cardTransactions=await whop().cardTransactions.list({account_id:accountId,first:50});
   cardAvailable=true;
   for(const transaction of cardTransactions.data){
    if(transaction.usd_amount===null)continue;
    activity.push({id:transaction.id,title:transaction.merchant_name||"Card transaction",
     amount:-transaction.usd_amount,date:new Date(transaction.created_at),status:transaction.status});
   }
  }catch(error){console.error("card_transactions_read_failed",{organizerId:session.organizerId,error})}
 }
 activity.sort((a,b)=>b.date.getTime()-a.date.getTime());
 return <div className="app">
  <aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav">
   <Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link href="/card">Card</Link><Link className="active" href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link>
  </nav></aside>
  <main className="main">
   <div className="topbar"><div><div className="muted small">Organizer activity</div><h1>Transactions</h1></div><Link className="btn btn-soft" href="/dashboard">Back to overview</Link></div>
   <section className="table-card"><div className="card-head"><div><strong>Recorded payments and Whop card activity</strong><div className="muted small">Payment amounts are gross; Whop balance and fees may differ.</div></div></div>
    {activity.length?activity.map(item=><div className="table-row" key={item.id}>
     <div><strong>{item.title}</strong></div><div><strong>{item.amount>=0?"+":""}{money(item.amount)}</strong></div>
     <div><span className="pill">{item.status}</span></div><div><span className="muted small">{item.date.toLocaleDateString()}</span></div>
    </div>):<div style={{padding:20}} className="muted">No recorded payments or card transactions yet.</div>}
   </section>
   {!cardAvailable&&<p className="muted small">Whop card activity is unavailable for this account.</p>}
  </main>
 </div>;
}
