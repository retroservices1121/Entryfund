import Link from "next/link";

export default function NewEvent() {
  return (
    <main className="shell">
      <nav className="nav">
        <Link className="brand" href="/">Entry<span>Fund</span></Link>
        <Link className="btn btn-soft" href="/dashboard">Back to dashboard</Link>
      </nav>

      <div className="form-wrap">
        <div style={{marginBottom:20}}>
          <div className="eyebrow">New collection</div>
          <h1 style={{fontSize:38,letterSpacing:"-.04em",margin:"8px 0"}}>What are you collecting money for?</h1>
          <p className="muted">Create the financial collection first. EntryFund does not manage brackets, scoring, or scheduling.</p>
        </div>

        <form className="form-card" action="/events/virginia-beach-open">
          <div className="field">
            <label>Collection name</label>
            <input name="name" defaultValue="Virginia Beach Cornhole Open" />
          </div>
          <div className="two">
            <div className="field">
              <label>Collection type</label>
              <select defaultValue="tournament">
                <option value="tournament">Tournament registration</option>
                <option value="league">League fees</option>
                <option value="tryout">Tryout fees</option>
                <option value="team">Team dues</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="field">
              <label>Event date</label>
              <input type="date" defaultValue="2026-10-24" />
            </div>
          </div>
          <div className="two">
            <div className="field">
              <label>Entry fee</label>
              <input inputMode="decimal" defaultValue="$50.00" />
            </div>
            <div className="field">
              <label>Capacity</label>
              <input inputMode="numeric" defaultValue="128" />
            </div>
          </div>
          <div className="field">
            <label>Registration fields</label>
            <input defaultValue="Name, email, phone, division, partner name" />
          </div>
          <button className="btn btn-blue" style={{width:"100%"}}>Create registration link</button>
        </form>
      </div>
    </main>
  );
}
