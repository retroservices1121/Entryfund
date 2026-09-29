export function cardRequestPhase(input:{
 role:string;
 hasAccount:boolean;
 hasBalanceAccess:boolean;
 hasAccountOwner:boolean;
 existingCards:number;
 applicationStatus:string|null;
 cardIssuingStatus:string|null;
}){
 if(input.role!=="owner"||!input.hasAccount||!input.hasBalanceAccess||!input.hasAccountOwner||input.existingCards>0)return null;
 if(input.applicationStatus===null)return "application";
 return input.applicationStatus==="approved"&&input.cardIssuingStatus==="active"?"issue":null;
}
