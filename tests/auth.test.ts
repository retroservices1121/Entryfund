import assert from "node:assert/strict";
import { test } from "node:test";
import { hashPassword,makeSessionToken,ownsOrganizer,sessionHash,setSessionCookie,verifyPassword } from "../lib/auth";
import { AccountExistsError,createOrganizerAccount } from "../lib/organizer-signup";
import type { PoolClient } from "pg";
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

test("session tokens are opaque and cookies are protected",()=>{
 const token=makeSessionToken();
 assert.notEqual(token,makeSessionToken());
 assert.notEqual(token,sessionHash(token));
 const cookie=setSessionCookie(token);
 assert.equal(cookie.httpOnly,true);
 assert.equal(cookie.sameSite,"lax");
 assert.equal(cookie.path,"/");
});

test("public signup creates a new organizer and never claims an existing email",async()=>{
 const statements:string[]=[];
 let existing=false;
 const client={query:async(sql:string)=>{
  statements.push(sql);
  if(sql.startsWith("SELECT 1"))return {rowCount:existing?1:0,rows:existing?[{one:1}]:[]};
  if(sql.startsWith("INSERT INTO users"))return {rowCount:1,rows:[{id:"user-new"}]};
  if(sql.startsWith("INSERT INTO organizers"))return {rowCount:1,rows:[{id:"org-new",name:"New Club",email:"new@example.com",whop_account_id:null}]};
  return {rowCount:1,rows:[]};
 }} as unknown as Pick<PoolClient,"query">;
 const created=await createOrganizerAccount(client,"New Club","new@example.com","password-hash");
 assert.equal(created.userId,"user-new");
 assert.equal(created.organizer.id,"org-new");
 assert.ok(statements.some(sql=>sql.startsWith("INSERT INTO memberships")));
 statements.length=0;existing=true;
 await assert.rejects(createOrganizerAccount(client,"Existing Club","existing@example.com","password-hash"),AccountExistsError);
 assert.equal(statements.length,1,"an existing email must not be modified");
});

test("organizer IDs and cross-site mutation origins cannot grant access",()=>{
 const session={userId:"user_a",organizerId:"organizer_a",role:"owner" as const};
 assert.equal(ownsOrganizer(session,"organizer_a"),true);
 assert.equal(ownsOrganizer(session,"organizer_b"),false);
 assert.equal(ownsOrganizer(null,"organizer_a"),false);
 assert.equal(sameOrigin(new Request("https://entryfund.example/api/collections",{headers:{origin:"https://entryfund.example"}})),true);
 assert.equal(sameOrigin(new Request("http://internal:3000/api/collections",{headers:{origin:"https://entryfund.example",host:"entryfund.example"}})),true);
 assert.equal(sameOrigin(new Request("http://internal:3000/api/collections",{headers:{origin:"https://attacker.example",host:"entryfund.example"}})),false);
 assert.equal(sameOrigin(new Request("https://entryfund.example/api/collections",{headers:{origin:"https://attacker.example"}})),false);
 assert.equal(sameOrigin(new Request("https://entryfund.example/api/collections")),false);
});
