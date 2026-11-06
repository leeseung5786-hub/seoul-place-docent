import test from 'node:test';
import assert from 'node:assert/strict';
import {createNodeEnv} from '../lib/runtime-env.ts';
import {createD1Http} from '../lib/runtime/d1-http.ts';
import {createR2Http} from '../lib/runtime/r2-http.ts';
import {isArchiveAdmin} from '../lib/archive-db.ts';

const config={accountId:'account',databaseId:'database',token:'fixture-d1-token'};
const ok=(results=[{name:'서울',count:3}])=>Response.json({success:true,result:[{success:true,results,meta:{duration:2,changes:1}}]});

test('Node reads runtime settings and leaves absent storage unconfigured',()=>{
 const settings={JUSO_API_KEY:'first',ARCHIVE_OWNER_EMAIL:'owner@example.test',ARCHIVE_ADMIN_TOKEN:'admin-token'};
 const env=createNodeEnv(settings);
 assert.equal(env.JUSO_API_KEY,'first');settings.JUSO_API_KEY='second';assert.equal(env.JUSO_API_KEY,'second');
 assert.equal(env.DB,undefined);assert.equal(env.BUCKET,undefined);
 const request=new Request('https://example.test/api/archive/session',{headers:{'oai-authenticated-user-id':'forged','oai-authenticated-user-email':'owner@example.test'}});
 assert.equal(isArchiveAdmin(request,env),false);
 assert.equal(isArchiveAdmin(new Request(request,{headers:{'x-archive-admin':'admin-token'}}),env),true);
});
test('Node creates existing D1 and R2 bindings only when fully configured',()=>{
 const env=createNodeEnv({CLOUDFLARE_ACCOUNT_ID:'account',CLOUDFLARE_D1_DATABASE_ID:'database',CLOUDFLARE_D1_API_TOKEN:'token',R2_BUCKET_NAME:'bucket',R2_ACCESS_KEY_ID:'access',R2_SECRET_ACCESS_KEY:'secret'});
 assert.equal(env.DB,env.DB);assert.equal(typeof env.DB.prepare,'function');assert.equal(env.BUCKET,env.BUCKET);assert.equal(typeof env.BUCKET.get,'function');
});
test('D1 preserves prepared SQL and bound values, authenticating only in headers',async()=>{
 const db=createD1Http(config,async(url,init)=>{
  assert.equal(url,'https://api.cloudflare.com/client/v4/accounts/account/d1/database/database/query');
  assert.equal(init.headers.Authorization,'Bearer fixture-d1-token');assert.equal(init.cache,'no-store');
  assert.deepEqual(JSON.parse(init.body),{sql:'SELECT * FROM places WHERE name=?',params:["서울'; DROP TABLE places; --"]});
  return ok();
 });
 const statement=db.prepare('SELECT * FROM places WHERE name=?').bind("서울'; DROP TABLE places; --");
 assert.equal((await statement.first()).name,'서울');assert.equal(await statement.first('count'),3);
 assert.deepEqual(await statement.raw({columnNames:true}),[['name','count'],['서울',3]]);
});
test('D1 batches use one documented batch request with ordered parameters',async()=>{
 let calls=0;
 const db=createD1Http(config,async(_url,init)=>{
  calls++;assert.deepEqual(JSON.parse(init.body),{batch:[{sql:'INSERT INTO places VALUES (?)',params:['서울']},{sql:'UPDATE places SET name=?',params:['한양']}]});
  return Response.json({success:true,result:[{success:true,results:[],meta:{changes:1}},{success:true,results:[],meta:{changes:2}}]});
 });
 assert.deepEqual((await db.batch([db.prepare('INSERT INTO places VALUES (?)').bind('서울'),db.prepare('UPDATE places SET name=?').bind('한양')])).map(r=>r.meta.changes),[1,2]);
 assert.equal(calls,1);assert.deepEqual(await db.batch([]),[]);assert.equal(calls,1);
});
test('D1 rejects remote failures without leaking response details or credentials',async()=>{
 for(const response of [new Response('fixture-d1-token',{status:403}),Response.json({success:false,errors:[{message:'secret SQL'}]}),Response.json({success:true,result:[{success:false,results:[]}]})]){
  const db=createD1Http(config,async()=>response);
  await assert.rejects(()=>db.prepare('SELECT secret').all(),error=>!/fixture|secret/.test(error.message));
 }
 const db=createD1Http(config,async()=>ok([]));assert.equal(await db.prepare('SELECT empty').first(),null);
});

const r2={accountId:'account',bucket:'archive',accessKeyId:'fixture-access',secretAccessKey:'fixture-secret'};
test('R2 signs private object requests and preserves upload metadata and bytes',async()=>{
 const bucket=createR2Http(r2,async(request)=>{
  assert.equal(request.url,'https://account.r2.cloudflarestorage.com/archive/places/%EC%84%9C%EC%9A%B8.json');
  assert.match(request.headers.get('Authorization'),/^AWS4-HMAC-SHA256 /);assert.equal(request.url.includes('fixture'),false);
  assert.equal(request.headers.get('Content-Type'),'application/json');assert.equal(request.headers.get('x-amz-meta-sourceid'),'source-1');
  assert.equal(await request.text(),'{"name":"서울"}');return new Response(null,{status:200});
 });
 await bucket.put('places/서울.json','{"name":"서울"}',{httpMetadata:{contentType:'application/json'},customMetadata:{sourceId:'source-1'}});
});
test('R2 missing objects stay null and successful JSON/body reads work',async()=>{
 assert.equal(await createR2Http(r2,async()=>new Response(null,{status:404})).get('missing'),null);
 const bucket=createR2Http(r2,async()=>Response.json({name:'서울'}));
 assert.deepEqual(await (await bucket.get('found')).json(),{name:'서울'});
 assert.ok((await bucket.get('found')).body);
 await assert.rejects(()=>bucket.get('../elsewhere'),/Invalid R2 object key/);
 await assert.rejects(()=>createR2Http(r2,async()=>new Response(null,{status:403})).get('private'),/R2 read failed/);
});
