import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { Pool } from "pg";

const secret="ws_test_literal_signing_secret";
process.env.WHOP_WEBHOOK_SECRET=secret;
process.env.DATABASE_URL="postgresql://test:test@localhost:5432/test";

function signed(body:unknown,options:{timestamp?:number;tamper?:boolean;signature?:string;id?:string}={}){
 const raw=JSON.stringify(body);
 const timestamp=String(options.timestamp??Math.floor(Date.now()/1000));
 const id=options.id??"msg_test";
 const signature=createHmac("sha256",secret).update(`${id}.${timestamp}.${raw}`).digest("base64");
 return new Request("http://localhost/api/whop/webhooks",{method:"POST",body:options.tamper?raw+" ":raw,headers:{
  "webhook-id":id,"webhook-timestamp":timestamp,"webhook-signature":options.signature??`v1,${signature}`,
 }});
}

test("webhook verification, deduplication, and transaction failures",async(t)=>{
 const statements:{sql:string;values?:unknown[]}[]=[];
 let duplicate=false;
 let fail=false;
 let releases=0;
 t.mock.method(Pool.prototype,"connect",async()=>({
  query:async(sql:string,values?:unknown[])=>{
   statements.push({sql,values});
   if(fail&&sql.includes("UPDATE registrations"))throw new Error("test database failure");
   return {rowCount:sql.includes("INSERT INTO webhook_events")&&duplicate?0:1,rows:[]};
  },release:()=>{releases++},
 }));
 const {POST}=await import("../app/api/whop/webhooks/route");
 const event={id:"msg_test",type:"payment.succeeded",data:{id:"pay_test",metadata:{kind:"entryfund_registration",registration_id:"reg_test"}}};
 for(const request of [signed(event,{tamper:true}),signed(event,{timestamp:Math.floor(Date.now()/1000)-600}),signed(event,{timestamp:Math.floor(Date.now()/1000)+600}),signed(event,{signature:"v1,bad"}),new Request("http://localhost/api/whop/webhooks",{method:"POST",body:JSON.stringify(event)})]){
  assert.equal((await POST(request)).status,401);
 }
 assert.equal(statements.length,0,"invalid signatures must never reach the database");
 assert.equal((await POST(signed({id:"msg_test",type:"payment.succeeded",data:null}))).status,400);
 assert.equal(statements.length,0);
 assert.deepEqual(await (await POST(signed(event))).json(),{received:true,outcome:"applied"});
 assert.equal(statements[0].sql,"BEGIN");
 assert.equal(statements.at(-1)?.sql,"COMMIT");
 assert.ok(statements.find(s=>s.sql.includes("UPDATE registrations")&&s.sql.includes("'failed'")));
 assert.deepEqual(statements.find(s=>s.sql.includes("UPDATE registrations"))?.values,["pay_test","reg_test"]);
 duplicate=true;statements.length=0;
 assert.deepEqual(await (await POST(signed(event))).json(),{received:true,outcome:"duplicate"});
 assert.ok(!statements.some(s=>s.sql.includes("UPDATE registrations")));
 duplicate=false;fail=true;statements.length=0;
 assert.equal((await POST(signed(event))).status,500);
 assert.equal(statements.at(-1)?.sql,"ROLLBACK");
 fail=false;statements.length=0;
 assert.equal((await POST(signed({id:"msg_refund",type:"refund.updated",data:{payment_id:"pay_test",status:"succeeded"}},{id:"msg_refund"}))).status,200);
 assert.ok(statements.some(s=>s.sql.includes("status='refunded'")));
 assert.equal(releases,4);
});
