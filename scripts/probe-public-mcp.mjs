import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const [endpoint,query='서울특별시 종로구 사직로 161',selected='0']=process.argv.slice(2);
if(!endpoint)throw new Error('Usage: node scripts/probe-public-mcp.mjs https://HOST/mcp [public-address] [candidate-index]');
const url=new URL(endpoint);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw new Error('Invalid MCP URL');
const index=Number(selected);assert.ok(Number.isInteger(index)&&index>=0);
const report={endpoint:url.href,at:new Date().toISOString(),client:'HTTP protocol probe, NOT a ChatGPT account test',checks:[]};
let seq=0;
async function call(method,params={},modern=false){
 const headers={'Content-Type':'application/json',Accept:'application/json, text/event-stream'};
 if(modern){Object.assign(headers,{'MCP-Protocol-Version':'2026-07-28','MCP-Method':method});params={...params,_meta:{'io.modelcontextprotocol/protocolVersion':'2026-07-28','io.modelcontextprotocol/clientCapabilities':{}}};}
 const response=await fetch(url,{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:++seq,method,params}),redirect:'manual',signal:AbortSignal.timeout(60000)});
 assert.equal(response.status,200,`${method}: HTTP ${response.status}; check host authentication/protection and headers`);
 assert.match(response.headers.get('content-type')||'',/application\/json/,'Login HTML is not an MCP response');
 const body=await response.json();assert.equal(body.error,undefined,method+' RPC error');return body.result;
}
const unwrap=result=>{assert.ok(!result.isError,'Tool returned an error');return JSON.parse(result.content[0].text);};
try{
 const init=await call('initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'public-deployment-probe',version:'1'}});
 assert.equal(init.protocolVersion,'2025-11-25');report.checks.push('initialize without OAuth: 200');
 const list=await call('tools/list');for(const name of ['search_place','prepare_place_answer'])assert.ok(list.tools.some(t=>t.name===name));report.checks.push('required tools discovered');
 await call('tools/list',{},true);report.checks.push('modern protocol headers accepted');
 const search=await call('tools/call',{name:'search_place',arguments:{query}});const candidates=unwrap(search).candidates;
 assert.ok(candidates[index],'Choose a valid candidate-index for this public test address');
 const answer=await call('tools/call',{name:'prepare_place_answer',arguments:{token:candidates[index].token,question:'이 동네의 시간을 알려줘',questionType:'동네 역사'}});
 const packet=unwrap(answer);assert.equal(packet.mode,'client_ai');assert.equal(packet.generation.serverAiCalls,0);assert.ok(packet.neighborhood.records.length>0);
 report.checks.push('search_place and prepare_place_answer succeeded without OAuth');report.records=packet.neighborhood.records.length;
 report.serverReceipt=answer._meta??null;report.success=true;
}catch(error){report.success=false;report.error=error.message;process.exitCode=1;}
await mkdir('.mcp-test-results',{recursive:true});await writeFile('.mcp-test-results/public-probe.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
