import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../.mcp-public/api/public-mcp.mjs';
const request=(method,params={})=>new Request('https://package.test/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});
const data=r=>JSON.parse(r.result.content[0].text);
test('deployable package executes unauthenticated search and evidence preparation without a model',async()=>{
 const saved={...process.env},original=globalThis.fetch,info=console.info;let calls=0;console.info=()=>{};
 process.env.JUSO_API_KEY='fixture-key';process.env.OPENAI_API_KEY='must-not-be-used';delete process.env.CLOUDFLARE_ACCOUNT_ID;
 const address={roadAddr:'서울특별시 종로구 사직로 161',jibunAddr:'서울특별시 종로구 세종로 1-1',siNm:'서울특별시',sggNm:'종로구',emdNm:'세종로',admCd:'1111011900',bdMgtSn:'fixture',bdNm:'경복궁',lnbrMnnm:'1',lnbrSlno:'1',mtYn:'0',zipNo:'03045'};
 globalThis.fetch=async url=>{assert.equal(new URL(String(url)).hostname,'business.juso.go.kr','only address provider is allowed');calls++;return Response.json({results:{common:{errorCode:'0',totalCount:'1'},juso:[address]}});};
 try{
  assert.equal((await app.fetch(request('initialize',{protocolVersion:'2025-11-25'}))).status,200);
  const search=await (await app.fetch(request('tools/call',{name:'search_place',arguments:{query:'사직로 161'}}))).json();assert.equal(search.result.isError,undefined);
  const token=data(search).candidates[0].token;
  const answer=await (await app.fetch(request('tools/call',{name:'prepare_place_answer',arguments:{token,question:'동네 역사를 알려줘',questionType:'동네 역사'}}))).json();assert.equal(answer.result.isError,undefined);
  const packet=data(answer);assert.equal(packet.mode,'client_ai');assert.equal(packet.generation.serverAiCalls,0);assert.ok(packet.neighborhood.records.length>0);assert.equal(calls,1);
 }finally{globalThis.fetch=original;console.info=info;for(const k of Object.keys(process.env))if(!(k in saved))delete process.env[k];Object.assign(process.env,saved);}
});
