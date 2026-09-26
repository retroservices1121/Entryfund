import type { Award, Expense, Refund, Registration } from "./domain";

export function collectionFinancials(input:{registrations:Registration[];expenses:Expense[];awards:Award[];refunds?:Refund[]}){
 const gross=input.registrations.filter(r=>r.status==="completed").reduce((s,r)=>s+r.amountCents,0);
 const expenses=input.expenses.filter(e=>e.status==="completed").reduce((s,e)=>s+e.amountCents,0);
 const awards=input.awards.filter(a=>a.status!=="failed").reduce((s,a)=>s+a.amountCents,0);
 const refunds=(input.refunds??[]).filter(r=>r.status==="completed").reduce((s,r)=>s+r.amountCents,0);
 return {gross,expenses,awards,refunds,available:gross-expenses-awards-refunds};
}
