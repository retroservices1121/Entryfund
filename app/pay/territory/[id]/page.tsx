import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import TerritoryCheckout from "./TerritoryCheckout";

export const dynamic="force-dynamic";
type Fee={id:string;territory_name:string;amount_cents:string;status:string;organizer_name:string};
const money=(cents:number)=>(cents/100).toLocaleString("en-US",{style:"currency",currency:"USD"});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function TerritoryPaymentPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{returned?:string}>}){
 const {id}=await params;
 if(!uuid.test(id))notFound();
 const result=await query<Fee>(
  "SELECT f.id,f.territory_name,f.amount_cents,f.status,o.name AS organizer_name FROM territory_fees f JOIN organizers o ON o.id=f.organizer_id WHERE f.id=$1",
  [id],
 );
 const fee=result.rows[0];if(!fee)notFound();
 const {returned}=await searchParams;
 const amount=money(Number(fee.amount_cents));
 return <main className="reg-page">
  <div className="row" style={{marginBottom:20}}><Link className="brand" href="/">Entry<span className="brand-accent">Fund</span></Link><span className="muted small">Territory payment</span></div>
  <section className="reg-hero"><div className="eyebrow" style={{color:"#baff2e"}}>One-time territory fee</div><h1>{fee.territory_name}</h1><p style={{color:"#cbd5e1"}}>Issued by {fee.organizer_name}</p><div className="row"><span>Amount due</span><span className="price">{amount}</span></div></section>
  {fee.status==="open"?(returned?<div className="checkout">Payment confirmation is pending. Please check back shortly.</div>:<TerritoryCheckout id={fee.id} amount={amount}/>):<div className="checkout"><h2 style={{marginTop:0}}>{fee.status==="paid"?"Payment received":"Payment under review"}</h2><p className="muted">This payment link is no longer available for checkout.</p></div>}
 </main>;
}
