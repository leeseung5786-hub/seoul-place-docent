import test from 'node:test';
import assert from 'node:assert/strict';
import {getDocentStory} from '../lib/docent-data.ts';
import {generatePlaceAnswer,pickScenes,placeAnswerStats,validateAnswer,DOCENT_RULES} from '../lib/place-answer.ts';
const story=getDocentStory('종로구','세종로');
const address={roadAddr:'서울특별시 종로구 사직로 161',jibunAddr:'세종로 1-1',sggNm:'종로구',emdNm:'세종로'};
/** Minimal in-memory D1: enough SQL shapes for the cache and the log. */
function fakeD1(){const cache=new Map(),log=[];const stmt=sql=>({bind:(...a)=>({
  first:async()=>{if(/FROM place_answer_cache/.test(sql)){const r=cache.get(a[0]);return r?{payload:r.payload,created_at:r.created_at}:null;}
    const rows=log.filter(r=>r[0]>=a[0]);const n=rows.length,sum=i=>rows.reduce((s,r)=>s+(r[i]||0),0),avg=f=>{const x=rows.filter(f);return x.length?x.reduce((s,r)=>s+r[3],0)/x.length:null;};
    return {n,cached:sum(1),ok:sum(7),gen_ms:avg(r=>!r[1]&&r[7]),cache_ms:avg(r=>r[1]),paragraphs:sum(4),omitted:sum(5),held:sum(6)};},
  all:async()=>{const m=new Map();for(const r of log)if(r[0]>=a[0]&&r[7])m.set(r[2],(m.get(r[2])||0)+1);return {results:[...m].map(([t,n])=>({t,n}))};},
  run:async()=>{if(/INSERT OR REPLACE INTO place_answer_cache/.test(sql))cache.set(a[0],{payload:a[1],created_at:a[2]});else if(/INSERT INTO place_answer_log/.test(sql))log.push(a);}})});
  return {cache,log,prepare:stmt,batch:async()=>[]};}
function mockOpenAI(make){const orig=globalThis.fetch;let calls=0;globalThis.fetch=async(url,init)=>{calls++;const body=JSON.parse(init.body);const records=JSON.parse(body.input).RECORDS;return Response.json({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(make(records,body))}]}]});};return {get calls(){return calls;},restore(){globalThis.fetch=orig;}};}
test('question words pull matching records forward, the rest is spread through time',()=>{const picked=pickScenes(story,'세종로 지하도 공사는 언제 했나요?',6);assert.ok(picked.some(s=>/지하도/.test(s.title)));assert.ok(picked.length<=6);});
test('paragraphs citing unknown records or new numbers are dropped',()=>{const scenes=pickScenes(story,'지하도',4);const id=scenes.find(s=>/지하도/.test(s.title)).id;
  const r=validateAnswer({question_type:'동네 역사',paragraphs:[{heading:'지하도',text:'세종로에 지하도를 만들었어요.',evidence_ids:[id]},{heading:'없는 근거',text:'무언가 있었어요.',evidence_ids:['nope']},{heading:'숫자',text:'1999년에 완공했어요.',evidence_ids:[id]}],held:['건물 자체의 역사']},scenes);
  assert.equal(r.paragraphs.length,1);assert.equal(r.omitted,2);assert.deepEqual(r.held,['건물 자체의 역사']);assert.equal(r.questionType,'동네 역사');});
test('generate → verify → store in D1 → reuse without a second AI call, with KPI',async()=>{
  const db=fakeD1();const ai=mockOpenAI(records=>({question_type:'시대별 모습',paragraphs:[{heading:records[0].title,text:'이 기록은 동네의 오래된 모습을 보여 줘요.',evidence_ids:[records[0].id]}],held:['이 건물 자체의 연혁']}));
  try{const env={OPENAI_API_KEY:'k',DB:db};let spent=0;
    const a=await generatePlaceAnswer({address,story,question:'옛날 모습이 궁금해요'},env,{beforeRequest:()=>spent++});
    assert.equal(a.cached,false);assert.equal(a.paragraphs.length,1);assert.equal(a.sources.length,1);assert.equal(a.questionType,'시대별 모습');assert.equal(spent,1);
    const b=await generatePlaceAnswer({address,story,question:'옛날 모습이 궁금해요'},env,{beforeRequest:()=>spent++});
    assert.equal(b.cached,true);assert.equal(ai.calls,1);assert.equal(spent,1);assert.deepEqual(b.paragraphs,a.paragraphs);
    const kpi=await placeAnswerStats(db);assert.equal(kpi.requests,2);assert.equal(kpi.cacheHitRate,0.5);assert.equal(kpi.successRate,1);assert.deepEqual(kpi.questionTypes,[{type:'시대별 모습',count:2}]);
  }finally{ai.restore();}
});
test('an answer with no verifiable paragraph is refused, not shown',async()=>{const ai=mockOpenAI(()=>({question_type:'기타',paragraphs:[{heading:'x',text:'근거 없는 이야기예요.',evidence_ids:[]}],held:[]}));
  try{await assert.rejects(generatePlaceAnswer({address,story,question:'?'},{OPENAI_API_KEY:'k'}),/근거와 맞는 설명/);}finally{ai.restore();}});
test('docent rules cover place vs neighborhood, 3 sentences, holding unverified content and per-paragraph sources',()=>{for(const k of ['장소와 동네를 구분','1~3문장','held','evidence_ids'])assert.ok(DOCENT_RULES.includes(k),k);});
