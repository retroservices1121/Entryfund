type Money={amount:string;currency:string}|null;

type Payment={
 status:string;
 paid_at:string|null;
 refunded_at:string|null;
 auto_refunded:boolean;
 account_id:string|null;
 checkout_configuration_id:string|null;
 plan_id:string|null;
 total:Money;
};

export function usdCents(value:Money){
 if(!value||value.currency!=="usd"||!/^\d{1,7}(?:\.\d{1,2})?$/.test(value.amount))return null;
 const [dollars,cents=""]=value.amount.split(".");
 return Number(dollars)*100+Number(cents.padEnd(2,"0"));
}

export function matchesFeePayment(payment:Payment,fee:{amount_cents:string;provider_checkout_id:string;whop_account_id:string},planId:string){
 return payment.status==="paid"&&payment.paid_at!==null&&payment.refunded_at===null&&!payment.auto_refunded&&
  payment.account_id===fee.whop_account_id&&payment.checkout_configuration_id===fee.provider_checkout_id&&
  payment.plan_id===planId&&(usdCents(payment.total)??-1)>=Number(fee.amount_cents);
}
