import Link from "next/link";

export default function Home() {
  return (
    <main>
      <div className="shell">
        <nav className="nav">
          <div className="brand">Entry<span>Fund</span></div>
          <div className="navlinks">
            <a href="#how">How it works</a>
            <Link href="/dashboard">Demo dashboard</Link>
            <Link className="btn btn-primary" href="/events/new">Create an event</Link>
          </div>
        </nav>

        <section className="hero">
          <div>
            <div className="eyebrow">Financial infrastructure for sports organizers</div>
            <h1>They run the sport. We run the money.</h1>
            <p>
              Collect registrations, know exactly who paid, manage event revenue, and spend
              directly from the same balance. No brackets. No scheduling. Just the financial side.
            </p>
            <div className="actions">
              <Link className="btn btn-blue" href="/events/new">Create your first event</Link>
              <Link className="btn btn-soft" href="/dashboard">View organizer dashboard</Link>
            </div>
          </div>

          <div className="panel">
            <div className="row"><strong>Virginia Beach Open</strong><span className="pill">128 / 128 paid</span></div>
            <div style={{height:14}} />
            <div className="money-card">
              <div className="label">Available event funds</div>
              <div className="amount">$5,811.42</div>
              <div className="row small"><span>EntryFund Visa •••• 1847</span><span>Active</span></div>
            </div>
            <div style={{height:14}} />
            <div className="row"><span className="muted">Collected</span><strong>$6,400.00</strong></div>
            <div style={{height:10}} />
            <div className="row"><span className="muted">Event spending</span><strong>$588.58</strong></div>
          </div>
        </section>

        <section id="how" className="section">
          <div className="eyebrow">One financial loop</div>
          <h2>Collect → Manage → Spend</h2>
          <p className="muted">Built for organizers who have outgrown “just Venmo me.”</p>
          <div className="grid3" style={{marginTop:24}}>
            <div className="feature"><strong>Collect registrations</strong><span className="muted">Share a link or QR code. Players register and pay without needing an EntryFund account.</span></div>
            <div className="feature"><strong>Manage event money</strong><span className="muted">See paid registrations, refunds, revenue, spending, and the balance for every event.</span></div>
            <div className="feature"><strong>Spend from the balance</strong><span className="muted">Use a virtual card for event expenses, then withdraw the remaining profit when you are ready.</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
