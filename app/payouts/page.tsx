import Link from "next/link";

const awards = [
  { recipient: "John Smith", reason: "1st Place", amount: "$2,000.00", status: "Ready for payout" },
  { recipient: "Mike Jones", reason: "2nd Place", amount: "$1,000.00", status: "Ready for payout" },
  { recipient: "Sarah Lee", reason: "3rd Place", amount: "$500.00", status: "Ready for payout" },
];

export default function PayoutsPage() {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebrand">EntryFund</div>
        <nav className="sidenav">
          <Link href="/dashboard">Overview</Link>
          <Link href="/events/new">Collections</Link>
          <Link href="/card">Card</Link>
          <Link href="/transactions">Transactions</Link>
          <Link className="active" href="/payouts">Winner payouts</Link>
          <Link href="/refunds">Refunds</Link>
          <Link href="/withdrawals">Withdrawals</Link>
        <Link href="/settings">Settings</Link></nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <div className="muted small">Virginia Beach Open</div>
            <h1>Winner payouts</h1>
          </div>
          <Link className="btn btn-soft" href="/dashboard">Back to overview</Link>
        </div>
        <section className="cards" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
          <div className="stat"><div className="muted small">Event funds available</div><div className="value">$5,811.42</div></div>
          <div className="stat"><div className="muted small">Awards prepared</div><div className="value">$3,500.00</div></div>
          <div className="stat"><div className="muted small">Remaining after awards</div><div className="value">$2,311.42</div></div>
        </section>
        <section className="table-card">
          <div className="card-head">
            <div>
              <strong>Payout ledger</strong>
              <div className="muted small">Organizer-entered awards only. EntryFund does not determine tournament results.</div>
            </div>
          </div>
          {awards.map((award) => (
            <div className="table-row" key={award.recipient}>
              <div><strong>{award.recipient}</strong><div className="muted small">{award.reason}</div></div>
              <div><strong>{award.amount}</strong><div className="muted small">Prize award</div></div>
              <div><span className="pill">{award.status}</span></div>
              <div><span className="muted small">Whop payout integration pending</span></div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
