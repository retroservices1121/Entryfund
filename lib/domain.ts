export type VerificationStatus="not_started"|"pending"|"verified"|"restricted";
export type MoneyStatus="pending"|"available"|"completed"|"failed"|"refunded";

export type Organizer={
 id:string;name:string;email:string;verificationStatus:VerificationStatus;
 whopAccountId?:string;createdAt:string;
};

export type Collection={
 id:string;organizerId:string;slug:string;name:string;type:"tournament"|"league"|"tryout"|"team"|"other";
 date:string;entryFeeCents:number;capacity:number;status:"draft"|"open"|"closed"|"settled";
};

export type Registration={
 id:string;collectionId:string;participantName:string;email:string;phone?:string;
 amountCents:number;status:MoneyStatus;providerPaymentId?:string;createdAt:string;
};

export type Expense={
 id:string;collectionId:string;merchant:string;description:string;amountCents:number;
 status:MoneyStatus;providerTransactionId?:string;createdAt:string;
};

export type Award={
 id:string;collectionId:string;recipientName:string;reason:string;amountCents:number;
 status:"draft"|"ready"|"processing"|"completed"|"failed";providerPayoutId?:string;
};

export type Refund={
 id:string;collectionId:string;registrationId:string;amountCents:number;
 status:"requested"|"processing"|"completed"|"failed";providerRefundId?:string;
};

export type Withdrawal={
 id:string;organizerId:string;amountCents:number;feeCents:number;
 status:"requested"|"in_transit"|"completed"|"failed"|"canceled"|"denied";
 providerWithdrawalId?:string;createdAt:string;
};

export const cents=(value:number)=>Math.round(value*100);
export const dollars=(value:number)=>value/100;
export const formatMoney=(centsValue:number)=>dollars(centsValue).toLocaleString("en-US",{style:"currency",currency:"USD"});
