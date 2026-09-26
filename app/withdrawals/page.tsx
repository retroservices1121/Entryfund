import Link from "next/link";

const withdrawals=[
 {date:"Sep 20, 2026",amount:"$1,000.00",destination:"Bank account •••• 4821",status:"Completed"},
 {date:"Sep 12, 2026",amount:"$410.00",destination:"Bank account •••• 4821",status:"Completed"},
];

export default function WithdrawalsPage(){
 return <div className="app">
  <aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav">
   <Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link href="/card">Card</Link><Link href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link className="active" href="/withdrawals">Withdrawals</Link>
  <Link href="/settings">Settings</Link></nav></aside>
  <main className="main">
   <div className="topbar"><div><div className="muted small">External transfers</div><h1>Withdrawals</h1></div><Link className="btn btn-soft" href="/dashboard">Back to overview</Link></div>
   <section className="cards" style={{gridTemplateColumns:"repeat(2,1fr)"}}>
    <div className="stat"><div className="muted small">Available to withdraw</div><div className="value">$9,355.18</div></div>
    <div className="stat"><div className="muted small">Total withdrawn</div><div className="value">$1,410.00</div></div>
   </section>
   <section className="table-card">
    <div className="card-head"><div><strong>Withdrawal history</strong><div className="muted small">External bank withdrawals will be routed through the Whop payout infrastructure when credentials are connected.</div></div></div>
    {withdrawals.map((w)=><div className="table-row" key={w.date+w.amount}>
     <div><strong>{w.amount}</strong><div className="muted small">{w.date}</div></div>
     <div><strong>{w.destination}</strong></div><div><span className="pill">{w.status}</span></div><div><span className="muted small">External withdrawal</span></div>
    </div>)}
   </section>
  </main>
 </div>
}