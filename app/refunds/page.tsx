import Link from "next/link";

const refunds=[
 {player:"Morgan Davis",event:"Virginia Beach Open",amount:"$50.00",status:"Completed"},
 {player:"Chris Allen",event:"Fall League",amount:"$50.00",status:"Pending"},
];

export default function RefundsPage(){
 return <div className="app">
  <aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav">
   <Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><a href="#">Card</a><a href="#">Transactions</a><Link href="/payouts">Winner payouts</Link><Link className="active" href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link>
  </nav></aside>
  <main className="main">
   <div className="topbar"><div><div className="muted small">Financial operations</div><h1>Refunds</h1></div><Link className="btn btn-soft" href="/dashboard">Back to overview</Link></div>
   <section className="table-card">
    <div className="card-head"><div><strong>Registration refunds</strong><div className="muted small">Track money returned to participants against the original collection.</div></div></div>
    {refunds.map((r)=><div className="table-row" key={r.player+r.event}>
     <div><strong>{r.player}</strong><div className="muted small">{r.event}</div></div>
     <div><strong>{r.amount}</strong></div><div><span className="pill">{r.status}</span></div><div><span className="muted small">Original payment linked</span></div>
    </div>)}
   </section>
  </main>
 </div>
}