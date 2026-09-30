import assert from "node:assert/strict";
import {test} from "node:test";
import {cardErrorForOwner} from "../lib/card-error";

test("card errors show the provider's actionable reason and request ID",()=>{
 const result=cardErrorForOwner({statusCode:422,body:{error:{message:"No approved identity verification for cardholder"}},requestId:"req_card_1234"});
 assert.deepEqual(result,{message:"Whop says: No approved identity verification for cardholder",requestId:"req_card_1234",status:422});
});

test("card errors do not send generic stack traces to the browser",()=>{
 const result=cardErrorForOwner(new Error("private stack detail"));
 assert.equal(result.message.includes("private stack detail"),false);
 assert.equal(result.requestId,null);
});
