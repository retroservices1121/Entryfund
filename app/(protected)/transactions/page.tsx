import Link from "next/link";
import { transactions } from "@/lib/mock";
import { requirePageSession } from "@/lib/auth";

const money=(n:number)=>n.toLocaleString("en-US",{style:"currency",currency:"USD"});

export default async function TransactionsPage(){
 await requirePageSession();
 return <div className="app">
  <aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav">
   <Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link href="/card">Card</Link><Link className="active" href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link>
  <Link href="/settings">Settings</Link></nav></aside>
  <main className="main">
   <div className="topbar"><div><div className="muted small">Organizer ledger</div><h1>Transactions</h1></div><Link className="btn btn-soft" href="/dashboard">Back to overview</Link></div>
   <section className="table-card">
    <div className="card-head"><div><strong>Money activity</strong><div className="muted small">Registration revenue and organizer card spending in one ledger.</div></div></div>
    {transactions.map((tx,i)=><div className="table-row" key={i}>
     <div><strong>{tx.merchant}</strong><div className="muted small">{tx.meta}</div></div>
     <div><strong>{tx.amount>0?"+":""}{money(tx.amount)}</strong></div>
     <div><span className="pill">{tx.amount>0?"Revenue":"Expense"}</span></div>
     <div><span className="muted small">{tx.date}</span></div>
    </div>)}
   </section>
  </main>
 </div>
}
