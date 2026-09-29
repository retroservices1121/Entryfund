import { WhopClient } from "@whop/sdk";
import { env } from "./env";
import { idempotencyKey } from "./idempotency";

let cached:WhopClient|undefined;

function createClient(){
 if(!env.whopApiKey)throw new Error("WHOP_COMPANY_API_KEY is not configured");
 return new WhopClient({
  token:env.whopApiKey,
  apiVersionDate:"2026-09-15",
  baseUrl:env.whopSandbox
   ?"https://sandbox-api.whop.com/api/v1"
   :"https://api.whop.com/api/v1",
 });
}

export function whop(){
 if(cached)return cached;
 cached=createClient();
 return cached;
}

export async function createConnectedCompany(input:{email:string;title:string;internalOrganizerId:string}){
 if(!env.whopCompanyId)throw new Error("WHOP_COMPANY_ID is not configured");
 return whop().accounts.create({
  email:input.email,
  title:input.title,
  send_customer_emails:false,
  metadata:{entryfund_organizer_id:input.internalOrganizerId},
 },{idempotencyKey:idempotencyKey(["organizer",input.internalOrganizerId])});
}

export async function createOrganizerOnboardingLink(input:{companyId:string;returnUrl:string;refreshUrl:string}){
 const link=await whop().accountLinks.create({
  account_id:input.companyId,
  use_case:"account_onboarding",
  return_url:input.returnUrl,
  refresh_url:input.refreshUrl,
 });
 return link.url;
}

export async function createRegistrationCheckout(input:{
 connectedCompanyId:string;
 registrationId:string;
 collectionId:string;
 organizerId:string;
 collectionName:string;
 amountCents:number;
 redirectUrl:string;
}){
 const checkout=await whop().checkoutConfigurations.create({
  account_id:input.connectedCompanyId,
  redirect_url:input.redirectUrl,
  plan:{
   account_id:input.connectedCompanyId,
   currency:"usd",
   initial_price:input.amountCents/100,
   plan_type:"one_time",
   title:input.collectionName,
  },
  metadata:{
   kind:"entryfund_registration",
   registration_id:input.registrationId,
   collection_id:input.collectionId,
   organizer_id:input.organizerId,
  },
 },{idempotencyKey:idempotencyKey(["registration",input.registrationId])});
 if(!checkout?.id||!checkout.purchase_url)throw new Error("Whop checkout did not return a session");
 return {sessionId:checkout.id,purchaseUrl:checkout.purchase_url};
}

export async function createOneTimeFeeCheckout(input:{
 connectedCompanyId:string;
 feeId:string;
 title:string;
 amountCents:number;
 redirectUrl:string;
}){
 const checkout=await whop().checkoutConfigurations.create({
  account_id:input.connectedCompanyId,
  redirect_url:input.redirectUrl,
  plan:{
   account_id:input.connectedCompanyId,
   currency:"usd",
   initial_price:input.amountCents/100,
   plan_type:"one_time",
   title:input.title.slice(0,30),
   force_create_new_plan:true,
   stock:1,
   unlimited_stock:false,
  },
  metadata:{kind:"entryfund_one_time_fee",one_time_fee_id:input.feeId},
 },{idempotencyKey:idempotencyKey(["one-time-fee",input.feeId])});
 if(!checkout?.id||!checkout.purchase_url)throw new Error("Whop checkout did not return a session");
 return {sessionId:checkout.id,purchaseUrl:checkout.purchase_url};
}

export async function retrievePayment(paymentId:string){
 return whop().payments.retrieve({id:paymentId});
}
