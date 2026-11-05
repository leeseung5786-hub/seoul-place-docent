import test from 'node:test';
import assert from 'node:assert/strict';
import {validateSceneNarrations,narrateScenes} from '../lib/docent-narration.ts';
const scene={id:'S1',kind:'document',date:'1936년',year:1936,order:1,title:'경성시가지계획에 따른 개발',text:'1936년 경성시가지계획으로 도시한옥이 조성되었습니다.',scope:'dong',photos:[],cutCount:0,evidence:[{title:'서울역사 자료',url:null,institution:'문헌'}]};
const good={id:'S1',intro:'1936년에는 도시한옥이 조성되며 동네의 모습이 달라졌어요.',heading:'도시한옥의 조성',detail:'경성시가지계획에 따라 주거지가 정비되었다고 기록돼요. 자세한 내용은 자료 원문에서 확인할 수 있어요.'};
test('narration is accepted when it only uses numbers found in the source',()=>{assert.equal(validateSceneNarrations({scenes:[good]},[scene])[0].heading,'도시한옥의 조성');});
test('narration with an invented year or number is rejected',()=>{
 assert.throws(()=>validateSceneNarrations({scenes:[{...good,detail:'1945년에는 다시 바뀌었어요.'}]},[scene]),x=>x.code==='NARRATION_NUMBERS');
 assert.throws(()=>validateSceneNarrations({scenes:[{...good,intro:'약 300가구가 살았어요.'}]},[scene]),x=>x.code==='NARRATION_NUMBERS');
});
test('narration with missing parts or the wrong shape is rejected',()=>{
 assert.throws(()=>validateSceneNarrations({scenes:[{...good,detail:''}]},[scene]),x=>x.code==='NARRATION_FORMAT');
 assert.throws(()=>validateSceneNarrations({scenes:[]},[scene]),x=>x.code==='NARRATION_FORMAT');
});
test('fresh narration counts once toward the limit and repeats are served from storage',async()=>{
 const old=globalThis.fetch;let calls=0;const store=new Map();const BUCKET={get:async k=>store.has(k)?{json:async()=>JSON.parse(store.get(k))}:null,put:async(k,v)=>{store.set(k,v);}};
 globalThis.fetch=async()=>{calls++;return Response.json({output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({scenes:[good]})}]}]});};
 let limited=0;
 try{
  const a=await narrateScenes([scene],'성북구','삼선동2가',{OPENAI_API_KEY:'test-only',OPENAI_MODEL:'narration-test',BUCKET},{beforeRequest:()=>{limited++;}});
  assert.equal(a[0].intro,good.intro);assert.equal(calls,1);assert.equal(limited,1);assert.equal(store.size,1);
  const b=await narrateScenes([scene],'성북구','삼선동2가',{OPENAI_API_KEY:'test-only',OPENAI_MODEL:'narration-test',BUCKET},{beforeRequest:()=>{limited++;}});
  assert.equal(b[0].heading,good.heading);assert.equal(calls,1);assert.equal(limited,1);
 }finally{globalThis.fetch=old;}
});
test('narration needs an AI key when nothing is stored',async()=>{await assert.rejects(()=>narrateScenes([{...scene,id:'S-nokey',text:'키 없는 장면 1936년'}],'성북구','삼선동2가',{}),x=>x.code==='NARRATION_KEY');});
