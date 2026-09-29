import Link from "next/link";

const sports=["Cornhole","Pickleball","Flag Football","Softball","Basketball","Darts","Pool","Esports"];

export default function Home(){
 return <main className="landing">
  <section className="hero-dark">
   <div className="shell">
    <nav className="nav landing-nav">
     <Link className="brand brand-light" href="/">Entry<span className="brand-accent">Fund</span></Link>
     <div className="navlinks navlinks-light">
      <a href="#product">Product</a><a href="#money">Money flow</a><a href="#sports">Sports</a>
      <Link className="btn btn-glass" href="/dashboard">Organizer login</Link>
      <Link className="btn btn-lime" href="/onboarding">Start collecting</Link>
     </div>
    </nav>

    <div className="hero-pro">
     <div className="hero-copy">
      <div className="signal"><span className="signal-dot"/> FINANCIAL INFRASTRUCTURE FOR COMPETITIVE SPORTS</div>
      <h1>From entry fee<br/>to <em>game money.</em></h1>
      <p>EntryFund gives leagues and tournament organizers one financial home to collect registrations, spend event revenue, track payouts, and withdraw profit.</p>
      <div className="actions">
       <Link className="btn btn-lime btn-xl" href="/onboarding">Create your first collection →</Link>
       <Link className="btn btn-glass btn-xl" href="/dashboard">Explore the product</Link>
      </div>
      <div className="trustline"><span>NO BRACKETS</span><span>NO SCHEDULING</span><span>NO TEAM CHAT</span><strong>JUST THE MONEY.</strong></div>
     </div>
     <div className="hero-visual">
      <div className="sport-photo" role="img" aria-label="Cornhole, flag football, and pickleball players">
       <div className="photo-shade"/>
       <div className="live-chip"><span className="live-dot"/> PRODUCT PREVIEW</div>
       <div className="float-balance">
        <div className="float-label">Virginia Beach Open</div>
        <div className="float-amount">$18,420.00</div>
        <div className="float-meta"><span>184 paid</span><span>92% capacity</span></div>
       </div>
       <div className="float-card">
        <div className="mini-card-top"><img className="whop-logo" src="/whop-mark.svg" alt="Whop"/><span>VISA<br/><small>Platinum</small></span></div>
        <div className="mini-card-number">•••• 1847</div>
        <div className="mini-card-bottom"><span>EntryFund</span><b>•••• 1847</b></div>
       </div>
      </div>
     </div>
    </div>
   </div>
  </section>

  <section className="ticker"><div className="ticker-track">{[...sports,...sports].map((s,i)=><span key={i}>{s}<b>✦</b></span>)}</div></section>

  <section id="product" className="section section-white">
   <div className="shell">
    <div className="section-kicker">THE FINANCIAL SIDE OF GAME DAY</div>
    <div className="split-heading"><h2>Stop running serious events through personal payment apps.</h2><p>When registrations become real revenue, you need more than a username and a transaction feed. EntryFund keeps the financial operation attached to the event from the moment money comes in.</p></div>
    <div className="flow-grid">
     <article className="flow-card flow-black"><div className="flow-num">01</div><div><div className="flow-icon">↙</div><h3>Collect</h3><p>Create a registration collection. Share the link or QR. Players pay without needing an EntryFund account.</p></div><div className="micro-ui"><span>128 / 128 PAID</span><strong>$6,400</strong></div></article>
     <article className="flow-card"><div className="flow-num">02</div><div><div className="flow-icon">◎</div><h3>Manage</h3><p>Every dollar already knows which collection it belongs to. Track revenue, refunds, expenses and available funds.</p></div><div className="micro-bars"><i/><i/><i/></div></article>
     <article className="flow-card flow-lime"><div className="flow-num">03</div><div><div className="flow-icon">↗</div><h3>Spend</h3><p>Use the organizer virtual card for event expenses instead of moving money to another bank first.</p></div><div className="micro-card"><img className="whop-logo micro-whop" src="/whop-mark.svg" alt="Whop"/><span>EntryFund · •••• 1847</span></div></article>
     <article className="flow-card"><div className="flow-num">04</div><div><div className="flow-icon">🏆</div><h3>Settle</h3><p>Track competitive prize payouts, reconcile the event, then withdraw the organizer's remaining profit.</p></div><div className="micro-ui"><span>EVENT NET</span><strong>$2,311</strong></div></article>
    </div>
   </div>
  </section>

  <section id="money" className="section money-section">
   <div className="shell money-layout">
    <div>
     <div className="section-kicker lime-text">ONE MONEY LOOP</div>
     <h2>Revenue shouldn't disappear into a bank transfer.</h2>
     <p className="money-copy">Keep event money useful from collection through settlement. EntryFund is designed so organizers can see exactly what came in, what went out, and what's actually theirs.</p>
     <div className="money-points">
      <div><b>01</b><span><strong>Players pay registration</strong><small>One link. One collection. Clean payer records.</small></span></div>
      <div><b>02</b><span><strong>Funds become operational</strong><small>Revenue and card spending live in the same financial workspace.</small></span></div>
      <div><b>03</b><span><strong>Organizer closes the event</strong><small>Account for refunds, prize awards and expenses before profit leaves.</small></span></div>
     </div>
    </div>
    <div className="ledger-demo">
     <div className="ledger-head"><span>EVENT FINANCIALS</span><span className="pill-dark">EXAMPLE</span></div>
     <div className="ledger-title"><div><small>Virginia Beach Open</small><strong>$18,420.00</strong></div><span>Illustrative balance</span></div>
     <div className="ledger-row"><span>Registrations</span><b className="positive">+$18,420.00</b></div>
     <div className="ledger-row"><span>Venue</span><b>−$2,750.00</b></div>
     <div className="ledger-row"><span>Marketing</span><b>−$840.00</b></div>
     <div className="ledger-row"><span>Prize awards prepared</span><b>−$8,000.00</b></div>
     <div className="ledger-total"><span>Event net</span><strong>$6,830.00</strong></div>
     <div className="ledger-actions"><span>SPEND WITH CARD</span><span>WITHDRAW PROFIT</span></div>
    </div>
   </div>
  </section>

  <section id="sports" className="section sports-section">
   <div className="shell">
    <div className="section-kicker">BUILT FOR ORGANIZER-DRIVEN SPORTS</div>
    <div className="split-heading"><h2>If people pay to compete, EntryFund can run the money.</h2><p>Start with cornhole. Expand anywhere organizers collect entry fees, operate events and settle payouts.</p></div>
    <div className="sports-grid">
     {sports.map((s,i)=><div className="sport-tile" key={s}><span>0{i+1}</span><strong>{s}</strong><i>↗</i></div>)}
    </div>
   </div>
  </section>

  <section className="final-cta">
   <div className="shell final-inner">
    <div><div className="section-kicker lime-text">MONEY MOVES. KEEP UP.</div><h2>They run the sport.<br/><em>We run the money.</em></h2></div>
    <div><p>Build your first collection and see what event finance looks like when it was designed for organizers from day one.</p><Link className="btn btn-lime btn-xl" href="/onboarding">Start with EntryFund →</Link></div>
   </div>
  </section>

  <footer className="site-footer"><div className="shell row"><div className="brand brand-light">Entry<span className="brand-accent">Fund</span></div><div className="small">Financial infrastructure for sports organizers.</div><div className="small">© 2026 EntryFund</div></div></footer>
 </main>
}
