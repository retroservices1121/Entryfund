import { whop } from "./whop";

type Balance={symbol:string;breakdown:{available:string;pending:string;reserve:string}};

export function usdBalance(balances:Balance[]){
 const usd=balances.find(balance=>balance.symbol.toUpperCase()==="USD");
 if(!usd)return null;
 const {available,pending,reserve}=usd.breakdown;
 if(![available,pending,reserve].every(value=>/^-?\d{1,12}(?:\.\d{1,2})?$/.test(value)))return null;
 return {available,pending,reserve};
}

export function formatUsd(value:string){
 return Number(value).toLocaleString("en-US",{style:"currency",currency:"USD"});
}

export async function getOrganizerWallet(accountId:string){
 const account=await whop().accounts.retrieve({id:accountId});
 if(account.id!==accountId)throw new Error("Whop account mismatch");
 return {balance:usdBalance(account.balances),cards:account.cards,capabilities:account.capabilities,ownerId:account.owner?.id};
}
