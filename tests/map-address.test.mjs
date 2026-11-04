import test from 'node:test';
import assert from 'node:assert/strict';
import {mapAddress,parseMapLocation,matchMapCandidates,validateMapPoint} from '../lib/map-address.ts';
import {verifyAddress} from '../lib/providers.ts';
const point={x:127.058,y:37.545};
const address={address_name:'서울 성동구 성수동2가 300-1',region_1depth_name:'서울',region_2depth_name:'성동구',region_3depth_name:'성수동2가',mountain_yn:'N',main_address_no:'300',sub_address_no:'1'};
const document={address,road_address:{address_name:'서울 성동구 아차산로 100',building_name:'예시 건물',zone_no:'04782'}};
const regions=[{region_type:'B',code:'1120011500',address_name:'서울특별시 성동구 성수동2가',region_1depth_name:'서울특별시',region_2depth_name:'성동구',region_3depth_name:'성수동2가'},{region_type:'H',code:'1120069000',region_1depth_name:'서울특별시',region_3depth_name:'성수2가1동'}];
const official={roadAddr:'서울특별시 성동구 아차산로 100',jibunAddr:'서울특별시 성동구 성수동2가 300-1',siNm:'서울특별시',sggNm:'성동구',emdNm:'성수동2가',admCd:'1120011500',bdMgtSn:'fixture-building',bdNm:'예시 건물',lnbrMnnm:'300',lnbrSlno:'1',mtYn:'0',zipNo:'04782'};
const secrets={KAKAO_REST_API_KEY:'fixture-rest-key',JUSO_API_KEY:'fixture-signing-key'};
test('map click preserves its exact point, parcel identity and separate administrative dong',()=>{
 const location=parseMapLocation(point.x,point.y,[document],regions);
 assert.deepEqual([location.x,location.y],[point.x,point.y]);assert.equal(location.precision,'parcel');assert.equal(location.address.roadAddr,official.roadAddr);assert.equal(location.address.admCd,official.admCd);assert.equal(location.administrativeDong,'성수2가1동');
 assert.equal(matchMapCandidates([{...official,token:'test'},{...official,lnbrSlno:'2',token:'other'}],location).length,1);
 assert.equal(matchMapCandidates([{...official,mtYn:'1',token:'mountain'}],location).length,0);
});
test('no building address still resolves the legal dong without inventing a road address or parcel',()=>{
 const location=parseMapLocation(point.x,point.y,[],regions);assert.equal(location.precision,'dong');assert.equal(location.address.roadAddr,'');assert.equal(location.address.lnbrMnnm,'');assert.equal(location.address.emdNm,'성수동2가');assert.equal(matchMapCandidates([{...official,token:'test'}],location).length,0);
});
test('invalid points and actual non-Seoul region codes are rejected before address selection',()=>{
 for(const [x,y] of [[NaN,37.5],[127,Infinity],[129,35],[37.5,127]])assert.throws(()=>validateMapPoint(x,y),e=>e.code==='MAP_POINT');
 assert.throws(()=>parseMapLocation(point.x,point.y,[document],[{...regions[0],code:'4113510900',region_1depth_name:'경기도'}]),e=>e.code==='OUTSIDE_SEOUL');
});
test('reverse lookup verifies the official address candidate and uses secret headers only',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async(url,init)=>{
  if(url.hostname==='dapi.kakao.com'){
   assert.equal(init.headers.Authorization,'KakaoAK fixture-rest-key');assert.equal(url.searchParams.get('x'),String(point.x));assert.equal(url.searchParams.has('key'),false);
   return Response.json({documents:url.pathname.includes('coord2address')?[document]:regions});
  }
  assert.equal(url.hostname,'business.juso.go.kr');assert.equal(url.searchParams.get('keyword'),official.roadAddr);
  return Response.json({results:{common:{errorCode:'0',totalCount:'2'},juso:[official,{...official,lnbrSlno:'2'}]}});
 };
 try{const result=await mapAddress(point.x,point.y,secrets);assert.equal(result.candidates.length,1);assert.deepEqual(await verifyAddress(result.candidates[0].token,secrets),official);}finally{globalThis.fetch=original;}
});
test('address-search failures preserve the selected point and neighborhood lookup',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async(url)=>url.hostname==='dapi.kakao.com'?Response.json({documents:url.pathname.includes('coord2address')?[document]:regions}):new Response('',{status:502});
 try{const result=await mapAddress(point.x,point.y,secrets);assert.equal(result.candidates.length,0);assert.equal(result.location.address.emdNm,'성수동2가');assert.match(result.message,/지연/);}finally{globalThis.fetch=original;}
});
test('provider authentication, quota and malformed responses remain distinct errors',async()=>{
 const original=globalThis.fetch;
 try{for(const [status,code] of [[401,'KAKAO_AUTH'],[429,'KAKAO_QUOTA']]){globalThis.fetch=async()=>new Response('',{status});await assert.rejects(()=>mapAddress(point.x,point.y,secrets),e=>e.code===code);}
 globalThis.fetch=async()=>Response.json({documents:{}});await assert.rejects(()=>mapAddress(point.x,point.y,secrets),e=>e.code==='MAP_FORMAT');
 }finally{globalThis.fetch=original;}
});
