function optional(name:string){return process.env[name]?.trim()||undefined}
function required(name:string){const value=optional(name);if(!value)throw new Error(`Missing required environment variable: ${name}`);return value}

export const env={
 appUrl:optional("NEXT_PUBLIC_APP_URL")??"http://localhost:3000",
 databaseUrl:optional("DATABASE_URL"),
 authSecret:optional("AUTH_SECRET"),
 whopApiKey:optional("WHOP_COMPANY_API_KEY")??optional("WHOP_API_KEY"),
 whopWebhookSecret:optional("WHOP_WEBHOOK_SECRET"),
 whopCompanyId:optional("WHOP_COMPANY_ID"),
 whopSandbox:optional("WHOP_SANDBOX")==="true",
};

export function assertFinancialConfig(){
 return {
  apiKey:env.whopApiKey??required("WHOP_COMPANY_API_KEY"),
  webhookSecret:required("WHOP_WEBHOOK_SECRET"),
  companyId:required("WHOP_COMPANY_ID"),
 };
}
