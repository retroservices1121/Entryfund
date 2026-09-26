import Link from "next/link";

export default function OnboardingPage(){
 return <main className="shell">
  <nav className="nav"><Link className="brand" href="/">Entry<span className="brand-accent">Fund</span></Link><Link className="btn btn-soft" href="/dashboard">Demo dashboard</Link></nav>
  <div className="form-wrap">
   <div className="signal" style={{color:"#2563eb"}}><span className="signal-dot"/> ORGANIZER ACCOUNT</div>
   <h1 style={{fontSize:44,letterSpacing:"-.05em",margin:"14px 0"}}>Set up your financial workspace.</h1>
   <p className="muted">Create the organizer profile once. You can run multiple collections and events underneath the same verified financial account.</p>
   <section className="form-card" style={{marginTop:24}}>
    <div className="field"><label>Organization / organizer name</label><input placeholder="Tidewater Cornhole"/></div>
    <div className="field"><label>Work email</label><input type="email" placeholder="you@organization.com"/></div>
    <div className="two"><div className="field"><label>Primary sport</label><select><option>Cornhole</option><option>Pickleball</option><option>Flag Football</option><option>Softball</option><option>Basketball</option><option>Other</option></select></div><div className="field"><label>Organizer type</label><select><option>Individual organizer</option><option>League</option><option>Club / team</option><option>Company</option><option>Nonprofit</option></select></div></div>
    <div style={{background:"#f4f7f3",padding:16,borderRadius:12,marginBottom:18}}><strong>Verification comes when you access funds.</strong><p className="muted small" style={{marginBottom:0}}>Create collections first. Identity/business verification unlocks the virtual card and withdrawals.</p></div>
    <Link className="btn btn-blue" style={{width:"100%"}} href="/events/new">Continue to first collection</Link>
   </section>
  </div>
 </main>
}