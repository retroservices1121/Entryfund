import Link from "next/link";

export default function CardPage(){
 return <div className="app">
  <aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav">
   <Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link className="active" href="/card">Card</Link><Link href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link>
  </nav></aside>
  <main className="main">
   <div className="topbar"><div><div className="muted small">Organizer spending</div><h1>Virtual card</h1></div><Link className="btn btn-soft" href="/dashboard">Back to overview</Link></div>
   <div className="dashboard-grid">
    <section className="card-box">
     <div className="card-head"><strong>EntryFund Visa</strong><span className="pill">Active</span></div>
     <div className="virtual-card">
      <div className="row"><strong>EntryFund</strong><span>VISA</span></div>
      <div><div className="digits">•••• •••• •••• 1847</div><div className="row small" style={{marginTop:12}}><span>TIDEWATER CORNHOLE</span><span>12/29</span></div></div>
     </div>
    </section>
    <section className="form-card">
     <div className="eyebrow">Spending control</div><h2 style={{margin:"8px 0 20px"}}>$9,355.18 available</h2>
     <div className="field"><label>Card status</label><input value="Active" readOnly /></div>
     <div className="field"><label>Default funding source</label><input value="Organizer balance" readOnly /></div>
     <div className="field"><label>Infrastructure</label><input value="Whop virtual card" readOnly /></div>
     <p className="muted small">Live freeze, limit, and card-detail controls will activate once Whop credentials are connected.</p>
    </section>
   </div>
  </main>
 </div>
}