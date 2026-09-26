import Link from "next/link";
import { events, organizer, transactions } from "@/lib/mock";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function Dashboard() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebrand">EntryFund</div>
        <nav className="sidenav">
          <Link className="active" href="/dashboard">Overview</Link>
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
          <div><div className="muted small">Organizer</div><h1>{organizer.name}</h1></div>
          <Link className="btn btn-blue" href="/events/new">+ Create collection</Link>
        </div>

        <section className="cards">
          <div className="stat"><div className="muted small">Total balance</div><div className="value">{money(organizer.balance)}</div></div>
          <div className="stat"><div className="muted small">Available</div><div className="value">{money(organizer.available)}</div></div>
          <div className="stat"><div className="muted small">Card spend</div><div className="value">{money(organizer.spent)}</div></div>
          <div className="stat"><div className="muted small">Withdrawn</div><div className="value">{money(organizer.withdrawn)}</div></div>
        </section>

        <div className="dashboard-grid">
          <section className="table-card">
            <div className="card-head"><strong>Collections</strong><Link className="small" href="/events/new">New collection</Link></div>
            {events.map((event) => (
              <Link className="table-row" href={"/dashboard/events/" + event.slug} key={event.slug}>
                <div><strong>{event.name}</strong><div className="muted small">{event.date}</div></div>
                <div><strong>{event.paid}/{event.capacity}</strong><div className="muted small">paid</div></div>
                <div><strong>{money(event.collected)}</strong><div className="muted small">collected</div></div>
                <div><span className="pill">{event.status}</span></div>
              </Link>
            ))}
          </section>

          <section className="card-box">
            <div className="card-head"><strong>Whop Card</strong><span className="pill">Active</span></div>
            <div className="virtual-card">
              <div className="row"><strong>EntryFund</strong><span>VISA</span></div>
              <div>
                <div className="digits">•••• •••• •••• 1847</div>
                <div className="row small" style={{marginTop:12}}><span>TIDEWATER CORNHOLE</span><span>12/29</span></div>
              </div>
            </div>
            <div style={{padding:"0 20px 20px"}} className="row">
              <div><div className="muted small">Spendable balance</div><strong>{money(organizer.available)}</strong></div>
              <button className="btn btn-soft">Manage</button>
            </div>
          </section>
        </div>

        <section className="card-box" style={{marginTop:18}}>
          <div className="card-head"><strong>Recent activity</strong><a className="small" href="#">View all</a></div>
          <div className="activity">
            {transactions.map((tx, i) => (
              <div className="activity-row" key={i}>
                <div><strong>{tx.merchant}</strong><div className="muted small">{tx.meta} · {tx.date}</div></div>
                <strong>{tx.amount > 0 ? "+" : ""}{money(tx.amount)}</strong>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
