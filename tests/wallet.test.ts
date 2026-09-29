import assert from "node:assert/strict";
import { test } from "node:test";
import { usdBalance } from "../lib/wallet";

test("wallet uses Whop's USD holding and keeps available separate from pending",()=>{
 const balance=usdBalance([
  {symbol:"USDT",breakdown:{available:"12.00",pending:"0",reserve:"0"}},
  {symbol:"USD",breakdown:{available:"0.64",pending:"1.00",reserve:"0.10"}},
 ]);
 assert.deepEqual(balance,{available:"0.64",pending:"1.00",reserve:"0.10"});
 assert.equal(usdBalance([]),null);
 assert.equal(usdBalance([{symbol:"USD",breakdown:{available:"unknown",pending:"0",reserve:"0"}}]),null);
});
