import assert from "node:assert/strict";
import { test } from "node:test";
import { matchesFeePayment } from "../lib/fee-payment-match";

const fee={amount_cents:"100",provider_checkout_id:"ch_fee",whop_account_id:"biz_organizer"};
const payment={status:"paid",paid_at:"2026-09-29T12:00:00Z",refunded_at:null,auto_refunded:false,
 account_id:"biz_organizer",checkout_configuration_id:"ch_fee",plan_id:"plan_fee",total:{amount:"1.00",currency:"usd"}};

test("only the paid charge for the fee's checkout and organizer can confirm it",()=>{
 assert.equal(matchesFeePayment(payment,fee,"plan_fee"),true);
 assert.equal(matchesFeePayment({...payment,status:"pending"},fee,"plan_fee"),false);
 assert.equal(matchesFeePayment({...payment,checkout_configuration_id:"ch_other"},fee,"plan_fee"),false);
 assert.equal(matchesFeePayment({...payment,account_id:"biz_other"},fee,"plan_fee"),false);
 assert.equal(matchesFeePayment({...payment,plan_id:"plan_other"},fee,"plan_fee"),false);
 assert.equal(matchesFeePayment({...payment,total:{amount:"0.99",currency:"usd"}},fee,"plan_fee"),false);
 assert.equal(matchesFeePayment({...payment,refunded_at:"2026-09-29T12:01:00Z"},fee,"plan_fee"),false);
});
