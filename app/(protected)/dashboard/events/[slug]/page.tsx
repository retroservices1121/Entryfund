import Link from "next/link";
import { requirePageSession } from "@/lib/auth";

const money=(n:number)=>n.toLocaleString("en-US",{style:"currency",currency:"USD"});

const registrations=[
 {name:"Alex Carter",status:"Paid",amount:50},
 {name:"Jordan Lee",status:"Paid",amount:50},
 {name:"Taylor Smith",status:"Paid",amount:50},
 {name:"Morgan Davis",status:"Refunded",amount:-50},
];

const expenses=[
 {name:"Venue deposit",amount:750},
 {name:"Meta advertising",amount:125},
 {name:"Hotel",amount:486.24},
];

export default async function EventFinancePage(){
 await requirePageSession();
 const collected=6400;
 const refunded=50;
 const spent=expenses.reduce((s,e)=>s+e.amount,0);
 const preparedPayouts=3500;
 const available=collected-refunded-spent-preparedPayouts;
 return <div className="app">
  <aside className="sidebar">
   <div className="sidebrand">EntryFund</div>
   <nav className="sidenav">
    <Link href="/dashboard">Overview</Link>
    <Link href="/events/new">Collections</Link>
    <Link href="/card">Card</Link>
    <Link href="/transactions">Transactions</Link>
    <Link href="/payouts">Winner payouts</Link>
    <Link href="/refunds">Refunds</Link>
    <Link href="/withdrawals">Withdrawals</Link>
   <Link href="/settings">Settings</Link></nav>
  </aside>
  <main className="main">
   <div className="topbar">
    <div><div className="muted small">Collection</div><h1>Virginia Beach Open</h1></div>
    <div style={{display:"flex",gap:10}}><Link className="btn btn-soft" href="/events/virginia-beach-open">Public registration</Link><Link className="btn btn-blue" href="/payouts">Winner payouts</Link></div>
   </div>
   <section className="cards">
    <div className="stat"><div className="muted small">Collected</div><div className="value">{money(collected)}</div></div>
    <div className="stat"><div className="muted small">Spent</div><div className="value">{money(spent)}</div></div>
    <div className="stat"><div className="muted small">Awards prepared</div><div className="value">{money(preparedPayouts)}</div></div>
    <div className="stat"><div className="muted small">Available profit</div><div className="value">{money(available)}</div></div>
   </section>
   <div className="dashboard-grid">
    <section className="table-card">
     <div className="card-head"><strong>Registrations</strong><span className="muted small">128 / 128 paid</span></div>
     {registrations.map((r,i)=><div className="table-row" key={i}>
      <div><strong>{r.name}</strong><div className="muted small">Tournament entry</div></div>
      <div><strong>{money(Math.abs(r.amount))}</strong></div>
      <div><span className="pill">{r.status}</span></div>
      <div><span className="muted small">Player</span></div>
     </div>)}
    </section>
    <section className="card-box">
     <div className="card-head"><strong>Event card activity</strong><span className="pill">Tracked</span></div>
     <div className="activity">
      {expenses.map((e,i)=><div className="activity-row" key={i}><div><strong>{e.name}</strong><div className="muted small">Event expense</div></div><strong>-{money(e.amount)}</strong></div>)}
     </div>
    </section>
   </div>
  </main>
 </div>
}
