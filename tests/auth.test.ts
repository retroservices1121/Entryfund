import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword,makeSessionToken,matchesInvitation,ownsOrganizer,sessionHash,setSessionCookie,verifyPassword } from "../lib/auth";
import { sameOrigin } from "../lib/request-security";

test("password hashes have unique salts and reject wrong credentials",async()=>{
 const password="a strong organizer password";
 const first=await hashPassword(password);
 const second=await hashPassword(password);
 assert.notEqual(first,second);
 assert.equal(await verifyPassword(password,first),true);
 assert.equal(await verifyPassword("wrong password",first),false);
 assert.equal(await verifyPassword(password,"malformed"),false);
});

test("invitation comparison fails closed and session tokens are opaque",()=>{
 const original=process.env.AUTH_SECRET;
 delete process.env.AUTH_SECRET;
 assert.equal(matchesInvitation("anything"),false);
 process.env.AUTH_SECRET="a-strong-operator-invitation-secret-0123456789";
 try{
  assert.equal(matchesInvitation(process.env.AUTH_SECRET),true);
  assert.equal(matchesInvitation("wrong"),false);
  const token=makeSessionToken();
  assert.notEqual(token,makeSessionToken());
  assert.notEqual(token,sessionHash(token));
  const cookie=setSessionCookie(token);
  assert.equal(cookie.httpOnly,true);
  assert.equal(cookie.sameSite,"lax");
  assert.equal(cookie.path,"/");
 }finally{
  if(original===undefined)delete process.env.AUTH_SECRET;
  else process.env.AUTH_SECRET=original;
 }
});

test("organizer IDs and cross-site mutation origins cannot grant access",()=>{
 const session={userId:"user_a",organizerId:"organizer_a",role:"owner" as const};
 assert.equal(ownsOrganizer(session,"organizer_a"),true);
 assert.equal(ownsOrganizer(session,"organizer_b"),false);
 assert.equal(ownsOrganizer(null,"organizer_a"),false);
 assert.equal(sameOrigin(new Request("https://entryfund.example/api/collections",{headers:{origin:"https://entryfund.example"}})),true);
 assert.equal(sameOrigin(new Request("https://entryfund.example/api/collections",{headers:{origin:"https://attacker.example"}})),false);
 assert.equal(sameOrigin(new Request("https://entryfund.example/api/collections")),false);
});
