import test from 'node:test';import assert from 'node:assert/strict';
import {auditReceiver} from '../lib/mcp-audit-receiver.ts';
import {recordMcpCall} from '../lib/mcp-audit.ts';
const row={requestId:'9cfebbac-77df-4f92-baea-e7fb69db5ab1',tool:'search_place',at:Date.now(),ok:true,records:2,ms:10,errorType:null,client:'unknown',validation:false};
const request=(value=row,key='receiver-secret')=>new Request('https://site.test/api/internal/mcp-audit',{method:'POST',headers:{'Content-Type':'application/json','x-mcp-audit-token':key},body:JSON.stringify(value)});
test('receiver authenticates separately from admin, rejects inputs, persists parameterized metadata',async()=>{
 const inserts=[];const db={prepare(sql){let values=[];return {bind(...params){values=params;return this;},async run(){if(sql.startsWith('INSERT'))inserts.push({sql,values});return {success:true};}};}};
 const receive=auditReceiver({DB:db,MCP_AUDIT_TOKEN:'receiver-secret'});
 assert.equal((await receive(request(row,'wrong-admin-key'))).status,403);
 assert.equal((await receive(request({...row,query:'private address'}))).status,400);
 assert.equal((await receive(request({...row,at:Date.now()-3600000}))).status,400);
 assert.equal((await receive(request({...row,tool:'sql'}))).status,400);
 assert.equal((await receive(request({...row,validation:true}))).status,400);
 const response=await receive(request());assert.equal(response.status,200);assert.equal((await response.json()).persisted,true);assert.equal(inserts.length,1);assert.equal(inserts[0].values[0],row.requestId);
 assert.equal((await auditReceiver({MCP_AUDIT_TOKEN:'receiver-secret'})(request())).status,503);
});
test('Vercel receives persistence receipt only after the fixed receiver saves the call; failures stay nonfatal',async()=>{
 const oldFetch=globalThis.fetch,oldUrl=process.env.MCP_AUDIT_URL,oldToken=process.env.MCP_AUDIT_TOKEN;
 try{
  process.env.MCP_AUDIT_URL='https://site.test/api/internal/mcp-audit';process.env.MCP_AUDIT_TOKEN='receiver-secret';
  globalThis.fetch=async(url,options)=>{assert.equal(String(url),'https://site.test/api/internal/mcp-audit');assert.equal(options.redirect,'manual');assert.deepEqual(JSON.parse(options.body),row);assert.equal(options.headers['x-mcp-audit-token'],'receiver-secret');return Response.json({persisted:true,requestId:row.requestId});};
  assert.equal(await recordMcpCall(undefined,row),true);
  globalThis.fetch=async()=>Response.json({persisted:true,requestId:'wrong'});assert.equal(await recordMcpCall(undefined,row),false);
  globalThis.fetch=async()=>new Response(null,{status:403});assert.equal(await recordMcpCall(undefined,row),false);
  process.env.MCP_AUDIT_URL='http://site.test/api/internal/mcp-audit';globalThis.fetch=async()=>{throw Error('must not send secret over HTTP');};assert.equal(await recordMcpCall(undefined,row),false);
 }finally{globalThis.fetch=oldFetch;for(const [k,v] of [['MCP_AUDIT_URL',oldUrl],['MCP_AUDIT_TOKEN',oldToken]])if(v===undefined)delete process.env[k];else process.env[k]=v;}
});
