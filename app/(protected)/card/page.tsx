import Link from "next/link";
import { requirePageSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { whop } from "@/lib/whop";
import { formatUsd, getOrganizerWallet } from "@/lib/wallet";
import CardAction from "./CardAction";
import { cardRequestPhase } from "@/lib/card-eligibility";

export const dynamic="force-dynamic";

export default async function CardPage(){
 const session=await requirePageSession();
 const result=await query<{whop_account_id:string|null}>("SELECT whop_account_id FROM organizers WHERE id=$1",[session.organizerId]);
 const accountId=result.rows[0]?.whop_account_id;
 let wallet:Awaited<ReturnType<typeof getOrganizerWallet>>|null=null;
 let cards:Array<{id:string;status:string|null;name:string|null;last4:string|null;type:string|null;spent_last_month:number|null}>|null=null;
 if(accountId){
  try{
   wallet=await getOrganizerWallet(accountId);
   cards=(await whop().cards.list({account_id:accountId})).data;
  }catch(error){console.error("organizer_card_read_failed",{organizerId:session.organizerId,error})}
 }
 const shownCards=cards??[];
 const requestPhase=cards&&cardRequestPhase({role:session.role,hasAccount:Boolean(accountId),
  hasBalanceAccess:Boolean(wallet?.capabilities),hasAccountOwner:Boolean(wallet?.ownerId),
  existingCards:cards.length,applicationStatus:wallet?.cards?.status??null});
 return <div className="app">
  <aside className="sidebar"><div className="sidebrand">EntryFund</div><nav className="sidenav">
   <Link href="/dashboard">Overview</Link><Link href="/events/new">Collections</Link><Link className="active" href="/card">Card</Link><Link href="/transactions">Transactions</Link><Link href="/payouts">Winner payouts</Link><Link href="/refunds">Refunds</Link><Link href="/withdrawals">Withdrawals</Link><Link href="/settings">Settings</Link>
  </nav></aside>
  <main className="main">
   <div className="topbar"><div><div className="muted small">Organizer spending</div><h1>Whop cards</h1></div><Link className="btn btn-soft" href="/dashboard">Back to overview</Link></div>
   <section className="cards" style={{gridTemplateColumns:"repeat(2,1fr)"}}>
    <div className="stat"><div className="muted small">Whop available (USD)</div><div className="value">{wallet?.balance?formatUsd(wallet.balance.available):"Unavailable"}</div></div>
    <div className="stat"><div className="muted small">Card application</div><div className="value" style={{fontSize:22}}>{wallet?wallet.cards?.status?.replaceAll("_"," ")??"Not started":"Unavailable"}</div></div>
   </section>
   <section className="table-card">
    <div className="card-head"><div><strong>Issued cards</strong><div className="muted small">Cards and status reported by Whop. Full card details stay in Whop.</div></div></div>
    {shownCards.length>0?shownCards.map(card=><div className="activity-row" style={{padding:"18px 20px"}} key={card.id}>
     <div><strong>{card.name||"Whop virtual card"} {card.last4?`•••• ${card.last4}`:""}</strong><div className="muted small">{card.type||"Card"} · Last 30 days: {typeof card.spent_last_month==="number"?formatUsd(String(card.spent_last_month/100)):"Unavailable"}</div></div>
     <span className="pill">{card.status||"Pending"}</span>
    </div>):<div style={{padding:20}} className="muted">{cards?"No card has been issued for this organizer.":"Card details are unavailable. Check Whop access or complete financial setup."}</div>}
   </section>
   {requestPhase?<section className="form-card" style={{marginTop:20}}><h2 style={{marginTop:0}}>{requestPhase==="issue"?"Issue a virtual card":"Apply for Whop Cards"}</h2><p className="muted">Whop manages eligibility and issues the card to the account owner. The application may require identity or business verification.</p><CardAction/></section>
    :!accountId?<p className="muted">Connect the organizer's Whop account in <Link href="/settings">Settings</Link> to begin card setup.</p>
    :wallet?.cards&&wallet.cards.status!=="approved"?<p className="muted">Whop card application status: {wallet.cards.status.replaceAll("_"," ")}. Continue verification in <Link href="/settings">Settings</Link> if action is needed.</p>
    :null}
  </main>
 </div>;
}
