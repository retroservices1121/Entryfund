import Link from "next/link";

export default function SettingsPage(){
 return <div className="app">
  <aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav"><Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link href="/card">Card</Link><Link href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link><Link className="active" href="/settings">Settings</Link></nav></aside>
  <main className="main">
   <div className="topbar"><div><div className="muted small">Tidewater Cornhole</div><h1>Account & verification</h1></div></div>
   <div className="dashboard-grid">
    <section className="form-card"><div className="eyebrow">Organizer</div><h2>Profile</h2><div className="field"><label>Name</label><input value="Tidewater Cornhole" readOnly/></div><div className="field"><label>Email</label><input value="organizer@example.com" readOnly/></div></section>
    <section className="form-card"><div className="eyebrow">Financial access</div><h2>Verified</h2><p className="muted">Your organizer identity is approved for financial features.</p><div className="row"><span>Virtual card</span><span className="pill">Enabled</span></div><div className="row" style={{marginTop:12}}><span>Withdrawals</span><span className="pill">Enabled</span></div></section>
   </div>
  </main>
 </div>
}