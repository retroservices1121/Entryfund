import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import RegistrationForm from "./RegistrationForm";

export const dynamic="force-dynamic";

const money=(cents:number)=>(cents/100).toLocaleString("en-US",{style:"currency",currency:"USD"});

export default async function RegistrationPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{registration?:string}>}){
 const {slug}=await params;const qs=await searchParams;
 const result=await query(
  `SELECT c.*,o.name AS organizer_name FROM collections c
   JOIN organizers o ON o.id=c.organizer_id
   WHERE c.slug=$1 AND c.status='open'
   ORDER BY c.created_at DESC LIMIT 1`,
  [slug]
 );
 const collection=result.rows[0];if(!collection)notFound();
 const paid=await query("SELECT COUNT(*)::int AS count FROM registrations WHERE collection_id=$1 AND status='completed'",[collection.id]);
 const remaining=Math.max(0,Number(collection.capacity)-Number(paid.rows[0]?.count||0));
 const date=collection.event_date?new Date(collection.event_date+"T00:00:00").toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}):"Date TBA";
 return <main className="reg-page">
  <div className="row" style={{marginBottom:20}}><Link className="brand" href="/">Entry<span className="brand-accent">Fund</span></Link><span className="muted small">Secure registration</span></div>
  <section className="reg-hero">
   <div className="eyebrow" style={{color:"#baff2e"}}>{String(collection.type).replace("_"," ")} registration</div>
   <h1>{collection.name}</h1>
   <div className="muted" style={{color:"#cbd5e1"}}>{date} · Organized by {collection.organizer_name}</div>
   <div style={{height:24}}/>
   <div className="row"><span>Entry fee</span><span className="price">{money(Number(collection.entry_fee_cents))}</span></div>
   <div className="small" style={{marginTop:10,color:"#cbd5e1"}}>{remaining} spots remaining</div>
  </section>
  {qs.registration&&<div style={{marginTop:16,padding:14,borderRadius:12,background:"#ecfdf5",color:"#047857"}}><strong>Welcome back.</strong> If your payment completed, EntryFund will update your registration as soon as Whop confirms it.</div>}
  {remaining>0?<RegistrationForm collectionId={collection.id} priceLabel={money(Number(collection.entry_fee_cents))}/>:<div className="checkout"><h2>Registration is full.</h2><p className="muted">This collection has reached capacity.</p></div>}
 </main>
}