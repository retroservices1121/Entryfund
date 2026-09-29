import { query } from "./db";
import { whop } from "./whop";
import { matchesFeePayment, usdCents } from "./fee-payment-match";

type Fee = {
 id:string;
 amount_cents:string;
 provider_checkout_id:string|null;
 whop_account_id:string|null;
};

export async function reconcileOneTimeFee(fee:Fee){
 if(!fee.provider_checkout_id||!fee.whop_account_id)return false;

 const checkout=await whop().checkoutConfigurations.retrieve({id:fee.provider_checkout_id});
 if(checkout.id!==fee.provider_checkout_id||checkout.account_id!==fee.whop_account_id||!checkout.plan?.id)return false;
 const metadata=checkout.metadata;
 if(metadata&&(metadata.kind!=="entryfund_one_time_fee"||metadata.one_time_fee_id!==fee.id)
  &&(metadata.kind!=="entryfund_territory_fee"||metadata.territory_fee_id!==fee.id))return false;

 const payments=await whop().payments.list({
  account_id:fee.whop_account_id,
  plan_id:checkout.plan.id,
  status:"paid",
  first:50,
 });
 const payment=payments.data.find(item=>matchesFeePayment(item,{
  amount_cents:fee.amount_cents,
  provider_checkout_id:fee.provider_checkout_id!,
  whop_account_id:fee.whop_account_id!,
 },checkout.plan!.id));
 if(!payment)return false;

 const updated=await query(
  `UPDATE one_time_fees f SET status='paid',provider_payment_id=$1,paid_at=$2,updated_at=now()
   FROM organizers o WHERE f.id=$3 AND f.organizer_id=o.id AND f.status='open'
   AND f.provider_checkout_id=$4 AND o.whop_account_id=$5 AND f.amount_cents<=$6`,
  [payment.id,payment.paid_at,fee.id,fee.provider_checkout_id,fee.whop_account_id,usdCents(payment.total)],
 );
 if(updated.rowCount===1)return true;
 const current=await query<{status:string;provider_payment_id:string|null}>(
  "SELECT status,provider_payment_id FROM one_time_fees WHERE id=$1",[fee.id]
 );
 return current.rows[0]?.status==="paid"&&current.rows[0].provider_payment_id===payment.id;
}
