import type { Award, Collection, Expense, Organizer, Refund, Registration, Withdrawal } from "./domain";

export const demoOrganizer:Organizer={
 id:"org_demo",name:"Tidewater Cornhole",email:"organizer@example.com",verificationStatus:"verified",whopAccountId:"whop_demo",createdAt:"2026-09-01"
};

export const demoCollections:Collection[]=[
 {id:"evt_vb",organizerId:"org_demo",slug:"virginia-beach-open",name:"Virginia Beach Open",type:"tournament",date:"2026-10-24",entryFeeCents:5000,capacity:128,status:"open"},
 {id:"evt_fall",organizerId:"org_demo",slug:"fall-league",name:"Fall League",type:"league",date:"2026-11-07",entryFeeCents:5000,capacity:100,status:"open"},
 {id:"evt_blind",organizerId:"org_demo",slug:"weekly-blind-draw",name:"Weekly Blind Draw",type:"tournament",date:"2026-09-30",entryFeeCents:2000,capacity:40,status:"open"}
];

export const demoRegistrations:Registration[]=[
 {id:"reg_1",collectionId:"evt_vb",participantName:"Alex Carter",email:"alex@example.com",amountCents:5000,status:"completed",createdAt:"2026-09-24"},
 {id:"reg_2",collectionId:"evt_vb",participantName:"Jordan Lee",email:"jordan@example.com",amountCents:5000,status:"completed",createdAt:"2026-09-24"},
 {id:"reg_3",collectionId:"evt_vb",participantName:"Taylor Smith",email:"taylor@example.com",amountCents:5000,status:"completed",createdAt:"2026-09-24"}
];

export const demoExpenses:Expense[]=[
 {id:"exp_1",collectionId:"evt_vb",merchant:"Virginia Beach Field House",description:"Venue deposit",amountCents:75000,status:"completed",createdAt:"2026-09-25"},
 {id:"exp_2",collectionId:"evt_vb",merchant:"Meta",description:"Event advertising",amountCents:12500,status:"completed",createdAt:"2026-09-24"},
 {id:"exp_3",collectionId:"evt_vb",merchant:"Marriott",description:"Staff hotel",amountCents:48624,status:"completed",createdAt:"2026-09-24"}
];

export const demoAwards:Award[]=[
 {id:"award_1",collectionId:"evt_vb",recipientName:"John Smith",reason:"1st Place",amountCents:200000,status:"ready"},
 {id:"award_2",collectionId:"evt_vb",recipientName:"Mike Jones",reason:"2nd Place",amountCents:100000,status:"ready"},
 {id:"award_3",collectionId:"evt_vb",recipientName:"Sarah Lee",reason:"3rd Place",amountCents:50000,status:"ready"}
];

export const demoRefunds:Refund[]=[
 {id:"refund_1",collectionId:"evt_vb",registrationId:"reg_4",amountCents:5000,status:"completed"}
];

export const demoWithdrawals:Withdrawal[]=[
 {id:"wd_1",organizerId:"org_demo",amountCents:100000,feeCents:0,status:"completed",createdAt:"2026-09-20"},
 {id:"wd_2",organizerId:"org_demo",amountCents:41000,feeCents:0,status:"completed",createdAt:"2026-09-12"}
];

export function collectionBySlug(slug:string){return demoCollections.find(c=>c.slug===slug);}
export function registrationsFor(id:string){return demoRegistrations.filter(r=>r.collectionId===id);}
export function expensesFor(id:string){return demoExpenses.filter(e=>e.collectionId===id);}
export function awardsFor(id:string){return demoAwards.filter(a=>a.collectionId===id);}
