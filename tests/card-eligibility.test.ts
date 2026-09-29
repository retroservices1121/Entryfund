import assert from "node:assert/strict";
import { test } from "node:test";
import { cardRequestPhase } from "../lib/card-eligibility";

const ready={role:"owner",hasAccount:true,hasBalanceAccess:true,hasAccountOwner:true,existingCards:0,applicationStatus:null};

test("card setup requires owner and available Whop account state",()=>{
 assert.equal(cardRequestPhase(ready),"application");
 assert.equal(cardRequestPhase({...ready,applicationStatus:"approved"}),"issue");
 assert.equal(cardRequestPhase({...ready,role:"admin"}),null);
 assert.equal(cardRequestPhase({...ready,hasBalanceAccess:false}),null);
 assert.equal(cardRequestPhase({...ready,existingCards:1}),null);
 assert.equal(cardRequestPhase({...ready,applicationStatus:"pending"}),null);
});
