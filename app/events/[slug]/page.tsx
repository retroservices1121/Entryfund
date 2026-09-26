import Link from "next/link";

export default function RegistrationPage() {
  return (
    <main className="reg-page">
      <div className="row" style={{marginBottom:20}}>
        <Link className="brand" href="/">Entry<span>Fund</span></Link>
        <span className="muted small">Secure registration</span>
      </div>

      <section className="reg-hero">
        <div className="eyebrow" style={{color:"#93c5fd"}}>Tournament registration</div>
        <h1>Virginia Beach Cornhole Open</h1>
        <div className="muted" style={{color:"#cbd5e1"}}>October 24, 2026 · Virginia Beach, VA</div>
        <div style={{height:24}} />
        <div className="row"><span>Entry fee</span><span className="price">$50</span></div>
      </section>

      <form className="checkout">
        <h2 style={{marginTop:0}}>Register</h2>
        <div className="two">
          <div className="field"><label>First name</label><input placeholder="Joe" /></div>
          <div className="field"><label>Last name</label><input placeholder="Player" /></div>
        </div>
        <div className="field"><label>Email</label><input type="email" placeholder="joe@example.com" /></div>
        <div className="field"><label>Phone</label><input placeholder="(757) 555-0100" /></div>
        <div className="two">
          <div className="field"><label>Division</label><select><option>Open</option><option>Competitive</option><option>Social</option></select></div>
          <div className="field"><label>Partner name</label><input placeholder="Optional" /></div>
        </div>
        <button type="button" className="btn btn-blue" style={{width:"100%"}}>Continue to payment · $50</button>
        <div className="footer-note">Payment checkout will be powered by Whop. Player does not need an EntryFund account.</div>
      </form>
    </main>
  );
}
