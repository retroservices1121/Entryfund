import Link from "next/link";
import { requirePageSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { whop } from "@/lib/whop";
import { formatUsd, getOrganizerWallet } from "@/lib/wallet";
import CardAction from "./CardAction";
import CardDetails from "./CardDetails";
import { cardRequestPhase } from "@/lib/card-eligibility";

export const dynamic="force-dynamic";

export default async function CardPage(){
 const session=await requirePageSession();
 const result=await query<{whop_account_id:string|null}>("SELECT whop_account_id FROM organizers WHERE id=$1",[session.organizerId]);
 const accountId=result.rows[0]?.whop_account_id;
 let wallet:Awaited<ReturnType<typeof getOrganizerWallet>>|null=null;
 let cards:Array<{id:string;status:string|null;name:string|null;last4:string|null;type:string|null;spent_last_month:number|null}>|null=null;
 if(accountId){
  try{wallet=await getOrganizerWallet(accountId)}
  catch(error){console.error("organizer_card_account_read_failed",{organizerId:session.organizerId,error})}
  if(wallet){
   try{cards=(await whop().cards.list({account_id:accountId})).data}
   catch(error){
    console.error("organizer_card_list_failed",{organizerId:session.organizerId,error});
    // Whop may block listing cards while the application is not approved.
    if(wallet.cards?.status!=="approved")cards=[];
   }
  }
 }
 const shownCards=cards??[];
 const requestPhase=cards&&cardRequestPhase({role:session.role,hasAccount:Boolean(accountId),
  hasBalanceAccess:Boolean(wallet?.capabilities),hasAccountOwner:Boolean(wallet?.ownerId),
  existingCards:cards.length,applicationStatus:wallet?.cards?.status??null,
  cardIssuingStatus:wallet?.capabilities?.card_issuing??null});
 const applicationStatus=wallet?.cards?.status??null;
 const statusMessage=applicationStatus==="needs_verification"||applicationStatus==="needs_information"
  ?"Whop needs identity information for this card application. Open Whop financial setup in Settings to finish or correct it."
  :applicationStatus==="pending"||applicationStatus==="manual_review"
  ?"Whop is reviewing this account's card application. Refresh this page after Whop updates it."
  :applicationStatus==="denied"||applicationStatus==="locked"||applicationStatus==="canceled"
  ?"Whop cannot issue a card for this account in its current state. Contact Whop support for the reason and next step."
  :applicationStatus==="approved"&&wallet?.capabilities?.card_issuing!=="active"
  ?"The card application is approved, but Whop has not enabled card issuing for this account yet."
  :null;
 return <div className="app">
  <aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav">
   <Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link className="active" href="/card">Card</Link><Link href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link><Link href="/settings">Settings</Link>
  </nav></aside>
  <main className="main">
   <div className="topbar"><div><div className="muted small">Organizer spending</div><h1>Whop cards</h1></div><Link className="btn btn-soft" href="/dashboard">Back to overview</Link></div>
   <section className="cards" style={{gridTemplateColumns:"repeat(2,1fr)"}}>
    <div className="stat"><div className="muted small">Whop available (USD)</div><div className="value">{wallet?.balance?formatUsd(wallet.balance.available):"Unavailable"}</div></div>
    <div className="stat"><div className="muted small">Card application</div><div className="value" style={{fontSize:22}}>{wallet?applicationStatus?.replaceAll("_"," ")??"Not started":"Unavailable"}</div><div className="muted small">Whop account country: {wallet?.country??"Unavailable"}</div><div className="muted small">Card issuing: {wallet?.capabilities?.card_issuing??"Unavailable"}</div>{wallet?.verification.individual&&<div className="muted small">Personal verification: {wallet.verification.individual.replaceAll("_"," ")}</div>}{wallet?.verification.business&&<div className="muted small">Business verification: {wallet.verification.business.replaceAll("_"," ")}</div>}</div>
   </section>
   <section className="table-card">
    <div className="card-head"><div><strong>Issued cards</strong><div className="muted small">Cards and status reported by Whop. Active card details are shown only to the organizer owner on request.</div></div></div>
    {shownCards.length>0?shownCards.map(card=><div className="activity-row" style={{padding:"18px 20px"}} key={card.id}>
     <div><strong>{card.name||"Whop virtual card"} {card.last4?`•••• ${card.last4}`:""}</strong><div className="muted small">{card.type||"Card"} · Last 30 days: {typeof card.spent_last_month==="number"?formatUsd(String(card.spent_last_month/100)):"Unavailable"}</div></div>
     <div style={{display:"grid",gap:8,justifyItems:"end"}}><span className="pill">{card.status||"Pending"}</span>{session.role==="owner"&&card.status==="active"&&<CardDetails cardId={card.id} last4={card.last4}/>}</div>
    </div>):<div style={{padding:20}} className="muted">{cards?"No card has been issued for this organizer.":"Card details are unavailable. Check Whop access or complete financial setup."}</div>}
   </section>
   {requestPhase?<section className="form-card" style={{marginTop:20}}><h2 style={{marginTop:0}}>{requestPhase==="issue"?"Issue a virtual card":"Start card application"}</h2><p className="muted">{requestPhase==="issue"?"Whop has approved card issuing for this account. The card will be assigned to its Whop account owner.":"Whop requires a separate card application for this connected account. Your completed payout verification may help, but Whop still reviews card eligibility."}</p><CardAction phase={requestPhase}/></section>
    :!accountId?<p className="muted">Connect the organizer's Whop account in <Link href="/settings">Settings</Link> to begin card setup.</p>
    :statusMessage?<p className="muted">{statusMessage} {(applicationStatus==="needs_verification"||applicationStatus==="needs_information")&&<Link href="/settings">Open Settings</Link>}</p>
    :!wallet?.capabilities?<p className="muted">Card eligibility is unavailable. The Whop API key needs account and balance read access.</p>
    :session.role!=="owner"?<p className="muted">The organizer owner can start card setup from this page.</p>
    :null}
  </main>
 </div>;
}
