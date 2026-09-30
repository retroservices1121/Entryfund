import assert from "node:assert/strict";
import { test } from "node:test";

process.env.WHOP_COMPANY_API_KEY="test_key";
process.env.WHOP_COMPANY_ID="biz_platform";
process.env.WHOP_SANDBOX="true";

test("Whop operations send the pinned API's URLs, headers, and request bodies",async()=>{
 const requests:{url:string;headers:Headers;body:Record<string,any>}[]=[];
 const original=globalThis.fetch;
 globalThis.fetch=async(input,init)=>{
  requests.push({url:String(input),headers:new Headers(init?.headers),body:init?.body?JSON.parse(String(init.body)):{}});
  return Response.json({id:"ch_test",purchase_url:"https://sandbox.whop.com/checkout/test",url:"https://sandbox.whop.com/onboarding/test"});
 };
 try{
  const api=await import("../lib/whop");
  await api.createConnectedCompany({email:"test@example.com",title:"Organizer",internalOrganizerId:"org_test"});
  await api.createOrganizerOnboardingLink({companyId:"biz_child",returnUrl:"https://example.com/return",refreshUrl:"https://example.com/refresh"});
  const checkout=await api.createRegistrationCheckout({connectedCompanyId:"biz_child",registrationId:"reg_test",collectionId:"collection_test",organizerId:"org_test",collectionName:"Entry",amountCents:1234,redirectUrl:"https://example.com/return"});
  const feeCheckout=await api.createOneTimeFeeCheckout({connectedCompanyId:"biz_child",feeId:"fee_test",title:"League dues",amountCents:50000,redirectUrl:"https://example.com/fee-return"});
  await api.retrievePayment("pay_test");
  await api.whop().accounts.retrieve({id:"biz_child"});
  await api.whop().cards.list({account_id:"biz_child"});
  await api.whop().cards.create({account_id:"biz_child",assigned_user_id:"user_owner",name:"Organizer card"},{idempotencyKey:"card-request-test"});
  await api.whop().cardTransactions.list({account_id:"biz_child",first:50});
  await api.whop().cards.retrieve({id:"icrd_test",account_id:"biz_child"});
  assert.deepEqual(requests.map(r=>r.url),[
   "https://sandbox-api.whop.com/api/v1/accounts",
   "https://sandbox-api.whop.com/api/v1/account_links",
   "https://sandbox-api.whop.com/api/v1/checkout_configurations",
   "https://sandbox-api.whop.com/api/v1/checkout_configurations",
   "https://sandbox-api.whop.com/api/v1/payments/pay_test",
   "https://sandbox-api.whop.com/api/v1/accounts/biz_child",
   "https://sandbox-api.whop.com/api/v1/cards?account_id=biz_child",
   "https://sandbox-api.whop.com/api/v1/cards",
   "https://sandbox-api.whop.com/api/v1/card_transactions?account_id=biz_child&first=50",
   "https://sandbox-api.whop.com/api/v1/cards/icrd_test?account_id=biz_child",
  ]);
  for(const request of requests){
   assert.equal(request.headers.get("authorization"),"Bearer test_key");
   assert.equal(request.headers.get("api-version-date"),"2026-09-15");
  }
  assert.equal(requests[0].body.email,"test@example.com");
  assert.equal(requests[0].body.parent_company_id,undefined);
  assert.equal(requests[1].body.account_id,"biz_child");
  assert.equal(requests[1].body.use_case,"account_onboarding");
  assert.equal(requests[2].body.account_id,"biz_child");
  assert.equal(requests[2].body.plan.account_id,"biz_child");
  assert.equal(requests[2].body.plan.initial_price,12.34);
  assert.equal(requests[2].body.plan.application_fee_amount,undefined);
  assert.equal(requests[2].body.metadata.registration_id,"reg_test");
  assert.equal(requests[3].body.metadata.kind,"entryfund_one_time_fee");
  assert.equal(requests[3].body.metadata.one_time_fee_id,"fee_test");
  assert.equal(requests[3].body.plan.title,"League dues");
  assert.equal(requests[3].body.plan.plan_type,"one_time");
  assert.equal(requests[3].body.plan.stock,1);
  assert.equal(requests[3].body.plan.unlimited_stock,false);
  assert.equal(requests[3].body.plan.force_create_new_plan,true);
  assert.equal(requests[7].body.account_id,"biz_child");
  assert.equal(requests[7].body.assigned_user_id,"user_owner");
  assert.equal(requests[7].headers.get("idempotency-key"),"card-request-test");
  assert.ok(requests[0].headers.get("idempotency-key"));
  assert.ok(requests[2].headers.get("idempotency-key"));
  assert.notEqual(requests[0].headers.get("idempotency-key"),requests[2].headers.get("idempotency-key"));
  assert.equal(checkout.sessionId,"ch_test");
  assert.equal(feeCheckout.sessionId,"ch_test");
 }finally{globalThis.fetch=original}
});
