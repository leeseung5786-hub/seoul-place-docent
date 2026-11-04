import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {classifyRecordGeography,filterArchiveRecords} from '../lib/archive-geography.ts';
import {nationalRecords,photoCollections} from '../lib/archives.ts';
import {validateSource} from '../lib/archive-validation.ts';

test('outside-scope homonyms across provinces, historical names and whitespace variants are omitted',()=>{
 const titles=[
  '경상북도 선산군 산동면 성수동-024',
  '경 상 북 도 선 산 군 대 동 면 성 수 동',
  '부산광역시 강서구 대저동 토지대장',
  '대구광역시 중구 남산동 지적도',
  '대전광역시 동구 용운동 기록',
  '전라남도 순천시 조례동 기록',
  '전북특별자치도 전주시 덕진구 금암동',
  '경남 김해시 삼정동 토지조사부',
  '인천 중구 신흥동 기록',
  '함경북도 경성군 기록',
 ];
 const rows=titles.map(title=>({title,description:'서울기록원 소장 자료'}));
 assert.deepEqual(filterArchiveRecords(rows).items,[]);
 assert.equal(filterArchiveRecords(rows).outsideScopeCount,titles.length);
});

test('Seoul evidence cannot come from a query, institution, dong alone or an ambiguous district',()=>{
 const titles=['신사동 토지조사부','중구 정동','강서구 가양동','(69년)재산조사 대조부 : 성수동1가 성수동2가','서울은행 부산지점'];
 for(const title of titles)assert.notEqual(classifyRecordGeography({title,institution:'서울특별시'}),'seoul');
 assert.equal(classifyRecordGeography({title:'부산광역시 강서구 기록',description:'서울특별시 관련 목록'}),'outside_scope');
 assert.equal(classifyRecordGeography({title:'서울특별시·부산광역시 합동 자료'}),'unconfirmed');
});

test('explicit Seoul, current district/dong pairs and historical capital names remain candidates',()=>{
 for(const title of ['서울특별시 성동구 성수동 공장','성동구 성수동2가 공장','경성부 시가지계획','漢城府 지도','Seoul city plan','경상북도 출신 주민의 서울 성수동 생활사'])assert.equal(classifyRecordGeography({title}),'seoul',title);
 assert.equal(classifyRecordGeography({title:'1970년대 풍경',description:'서울특별시 종로구 일대의 사진이다.'}),'seoul');
 assert.equal(classifyRecordGeography({title:'경기도 광주군 언주면 압구정리 · 서울 편입 전'}),'seoul');
});

test('Gyeonggi records remain eligible with province, municipality, historical or English place names',()=>{
 for(const title of ['경기도 성남시 분당구 정자동 기록','수원시 팔달구 화서동 토지조사부','고양특례시 일산동구 장항동 지도','경 기 도 고 양 군 연 희 면','京畿道 高陽郡 지도','Gyeonggi-do Suwon city map','경기도 광주시 곤지암읍 기록']){
  assert.equal(classifyRecordGeography({title}),'gyeonggi',title);
  assert.equal(filterArchiveRecords([{title}]).items.length,1,title);
  assert.equal(validateSource({title,institution:'기록관',url:'https://example.org/gyeonggi'}).title,title);
 }
 assert.deepEqual(filterArchiveRecords([]).geographicScope,['서울특별시','경기도']);
});

test('metropolitan cities outside the scope are not inferred to be Gyeonggi',()=>{
 for(const title of ['인천광역시 계양구 계산동 기록','부산광역시 강서구 가락동 기록','광주광역시 북구 용봉동 사진','세종특별자치시 조치원읍 사진','慶尙北道 善山郡 기록','Incheon city map','강원특별자치도 원주시 기록']){
  assert.equal(classifyRecordGeography({title}),'outside_scope',title);
  assert.throws(()=>validateSource({title,institution:'서울기록원',url:'https://example.org/outside'}),e=>e.code==='ARCHIVE_GEOGRAPHY',title);
 }
 assert.equal(classifyRecordGeography({title:'광주시 지도'}),'unconfirmed');
});

test('explicit photograph location distinguishes a Seoul monument from the event depicted',()=>{
 assert.equal(classifyRecordGeography({title:'제주도의 만세운동 부조상',location:'서울 탑골공원(원각사지)'}),'seoul');
 assert.equal(classifyRecordGeography({title:'서울 관련 기념비',location:'부산광역시 중구'}),'outside_scope');
 assert.equal(classifyRecordGeography({title:'국유림 경계도',description:'경기도 고양군 연희면 신촌리 지도. 국가기록원 부산분원 소장.'}),'gyeonggi');
 assert.equal(classifyRecordGeography({title:'사진 자료',description:'국가기록원 부산분원 소장'}),'unconfirmed');
 assert.equal(classifyRecordGeography({title:'인천공항~김포공항 공항철도'}),'unconfirmed');
 assert.equal(classifyRecordGeography({title:'서울 기록',location:'서울특별시·부산광역시'}),'unconfirmed');
 assert.equal(classifyRecordGeography({title:'부산에서 촬영한 사진'}),'outside_scope');
 assert.notEqual(classifyRecordGeography({title:'세종로는 세종의 묘호에서 이름을 취했다고 설명한다.'}),'outside_scope');
 assert.equal(classifyRecordGeography({title:'인천국제공항 개항에 맞춰 강서구 방화동과 연결'}),'unconfirmed');
 assert.throws(()=>validateSource({title:'국유림 경계도',summary:'경상북도 선산군 성수동 지도',institution:'서울기록원',url:'https://example.org/outside'}),e=>e.code==='ARCHIVE_GEOGRAPHY');
});

test('all 467 registered dong queries and all provider pages use the same server scope',async()=>{
 const districts=JSON.parse(readFileSync(new URL('../data/seoul-regions.json',import.meta.url),'utf8')).districts;
 const previous=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response('<rss><channel><total>99</total><item><title>전라남도 순천시 신흥동</title><prod_name>서울특별시</prod_name></item><item><title>지역 미기재 신흥동 기록</title></item><item><title>서울특별시 종로구 지도</title></item><item><title>경기도 수원시 지도</title></item></channel></rss>');};
 try{
  for(const d of districts)for(const dong of d.dongs){const page=calls%99+1;const r=await nationalRecords(dong,page,{NATIONAL_ARCHIVES_API_KEY:'test-only'});assert.deepEqual(r.items.map(i=>i.title),['서울특별시 종로구 지도','경기도 수원시 지도']);assert.equal(r.excludedCount,2);assert.equal(r.outsideScopeCount,1);assert.equal(r.unconfirmedLocationCount,1);assert.equal(r.page,page);assert.equal(r.total,99);assert.ok(!JSON.stringify(r).includes('순천'));}
  assert.equal(calls,467);
 }finally{globalThis.fetch=previous;}
});

test('photo scope is applied before pagination, including cached lists and downloads',async()=>{
 const previous=globalThis.fetch;let calls=0;
 const rows=[...Array.from({length:11},(_,i)=>({ID:String(i),TITLE:'서울특별시 종로구 풍경 '+i,DESC:'공개 목록'})),{ID:'outside',TITLE:'부산광역시 중구 풍경',DESC:'서울기록원 보관'},{ID:'unknown',TITLE:'지역 미기재 풍경',DESC:''}];
 globalThis.fetch=async()=>{calls++;return Response.json({totalCount:rows.length,data:rows});};
 try{
  const first=await photoCollections('풍경',1,{SEOUL_PHOTOS_API_KEY:'test-only'});
  const second=await photoCollections('풍경',2,{SEOUL_PHOTOS_API_KEY:'test-only'});
  assert.equal(first.items.length,10);assert.equal(second.items.length,1);assert.equal(first.total,11);assert.equal(first.providerTotal,13);assert.equal(first.excludedCount,2);assert.equal(first.filterScope,'query');assert.equal(calls,1);
  assert.ok(!JSON.stringify([first,second]).includes('부산광역시'));
 }finally{globalThis.fetch=previous;}
});

test('new imports cannot relabel explicit non-Seoul titles with a Seoul region tag',()=>{
 const input={title:'경상북도 선산군 대동면 성수동',institution:'서울특별시',url:'https://www.archives.go.kr/record/1',regionIds:['dong-성동구-성수동1가']};
 assert.throws(()=>validateSource(input),e=>e.code==='ARCHIVE_GEOGRAPHY');
 const historical=validateSource({...input,title:'서울 노원구 하계동 연혁',summary:'1914년 양주군 노해면 하계리의 기록.',regionIds:['dong-노원구-하계동']});
 assert.equal(historical.summary,'1914년 양주군 노해면 하계리의 기록.');
});

test('whitespace normalization cannot invent province abbreviations in legitimate Seoul titles',()=>{
 for(const title of ['봉은사 일대 전경(2008)','1-1000번지 일대 전경사진','20세기 이전 북아현의 경관 재구성','서울지명사전 · 남대문로1가','서울지명사전 · 북창동']){
  assert.notEqual(classifyRecordGeography({title}),'outside_scope',title);
  assert.equal(validateSource({title,institution:'서울역사박물관',url:'https://museum.seoul.go.kr/archive/1'}).title,title);
 }
});

test('stored research has no confirmed outside-only locations, including raw caption homonyms',()=>{
 const photo=JSON.parse(readFileSync(new URL('../data/photo-research/bundle.json',import.meta.url),'utf8'));
 const docs=JSON.parse(readFileSync(new URL('../data/document-research/bundle.json',import.meta.url),'utf8'));
 const video=JSON.parse(readFileSync(new URL('../data/uploaded-city-history-report-2026-10-20.json',import.meta.url),'utf8'));
 const records=[
  ...photo.items.map(r=>({id:r.id,title:r.values['자료명'],location:r.values['원문장소표기'],description:r.values['내용설명']})),
  ...docs.tables.sources.map(r=>({id:r.id,title:r.values['자료명'],location:r.values['원문장소표기']||r.values['공간범위'],description:r.values['내용설명']})),
  ...video.items.map(r=>({id:r.id,title:r.claimExcerpt})),
 ];
 assert.deepEqual(records.filter(r=>classifyRecordGeography(r)==='outside_scope').map(r=>r.id),[]);
});
