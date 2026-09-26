import Link from "next/link";
export default function NotFound(){return <main className="shell" style={{paddingTop:80,paddingBottom:80}}><div className="form-card"><div className="eyebrow">404</div><h1>We couldn't find that page.</h1><p className="muted">Return to your EntryFund financial workspace.</p><Link className="btn btn-primary" href="/dashboard">Go to dashboard</Link></div></main>}
