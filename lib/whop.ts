import { Whop } from "@whop/sdk";
import { env } from "./env";

let cached:ReturnType<typeof createClient>|undefined;

function createClient(){
 if(!env.whopApiKey)throw new Error("WHOP_COMPANY_API_KEY is not configured");
 return new Whop({
  apiKey:env.whopApiKey,
  baseURL:env.whopSandbox
   ?"https://sandbox-api.whop.com/api/v1"
   :"https://api.whop.com/api/v1",
  ...(env.whopWebhookSecret
   ?{webhookKey:Buffer.from(env.whopWebhookSecret).toString("base64")}
   :{}),
 });
}

export function whop(){
 if(cached)return cached;
 cached=createClient();
 return cached;
}

export async function createConnectedCompany(input:{email:string;title:string;internalOrganizerId:string}){
 if(!env.whopCompanyId)throw new Error("WHOP_COMPANY_ID is not configured");
 return whop().companies.create({
  email:input.email,
  parent_company_id:env.whopCompanyId,
  title:input.title,
  send_customer_emails:false,
  metadata:{entryfund_organizer_id:input.internalOrganizerId},
 });
}

export async function createOrganizerOnboardingLink(input:{companyId:string;returnUrl:string;refreshUrl:string}){
 const link=await whop().accountLinks.create({
  company_id:input.companyId,
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
  redirect_url:input.redirectUrl,
  plan:{
   company_id:input.connectedCompanyId,
   currency:"usd",
   initial_price:input.amountCents/100,
   plan_type:"one_time",
   application_fee_amount:0,
   title:input.collectionName,
  },
  metadata:{
   kind:"entryfund_registration",
   registration_id:input.registrationId,
   collection_id:input.collectionId,
   organizer_id:input.organizerId,
  },
 });
 if(!checkout?.id||!checkout.purchase_url)throw new Error("Whop checkout did not return a session");
 return {sessionId:checkout.id,purchaseUrl:checkout.purchase_url};
}

export async function retrievePayment(paymentId:string){
 return whop().payments.retrieve(paymentId);
}
