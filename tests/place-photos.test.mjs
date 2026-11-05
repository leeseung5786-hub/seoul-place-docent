import test from 'node:test';
import assert from 'node:assert/strict';
import {commonsPhoto,findPlacePhotos,inSeoul,parseYear,placePhotoScene,rankPhotos,stripHtml} from '../lib/place-photos.ts';
import {photoResearchThumbnail} from '../lib/photo-research.ts';
const page=(over={},meta={})=>({pageid:1,title:'File:Namdaemun 1904.jpg',imageinfo:[{url:'https://upload.wikimedia.org/wikipedia/commons/a/a1/Namdaemun_1904.jpg',thumburl:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Namdaemun_1904.jpg/900px-Namdaemun_1904.jpg',descriptionurl:'https://commons.wikimedia.org/wiki/File:Namdaemun_1904.jpg',mime:'image/jpeg',extmetadata:{LicenseShortName:{value:'Public domain'},Artist:{value:'<a href="x">John Doe</a>'},DateTimeOriginal:{value:'1904'},ImageDescription:{value:'<b>남대문</b> &amp; 거리'},...meta},...over}]});
test('helpers',()=>{assert.equal(parseYear('c. 1904-05'),1904);assert.equal(parseYear('no year'),null);assert.equal(stripHtml('<a>a</a> &amp; b'),'a & b');assert.ok(inSeoul(126.97,37.56));assert.ok(!inSeoul(0,0));});
test('accepts open licences with provenance',()=>{const p=commonsPhoto(page(),18,'nearby');assert.equal(p.year,1904);assert.equal(p.creator,'John Doe');assert.equal(p.description,'남대문 & 거리');assert.match(p.sourceUrl,/commons\.wikimedia\.org/);});
test('rejects unclear licences, non-free and non-image',()=>{
  assert.equal(commonsPhoto(page({},{LicenseShortName:{value:'All rights reserved'}}),1,'nearby'),null);
  assert.equal(commonsPhoto(page({},{LicenseShortName:{value:''}}),1,'nearby'),null);
  assert.equal(commonsPhoto(page({},{NonFree:{value:'true'}}),1,'nearby'),null);
  assert.equal(commonsPhoto(page({mime:'application/pdf'}),1,'nearby'),null);
  assert.equal(commonsPhoto(page({thumburl:'http://evil.example/a.jpg',url:'http://evil.example/a.jpg'}),1,'nearby'),null);
});
test('rank: nearby and dated first, deduped',()=>{const a=commonsPhoto(page(),50,'nearby'),b={...a,id:'b',year:null,distance:5},c={...a,id:'c',year:1950,distance:300},n={...a,id:'n',match:'neighborhood'};
  assert.deepEqual(rankPhotos([b,n,c,a,a]).map(p=>p.id),['pp:commons:1','c','b','n']);});
test('scene is displayable by existing photo pipeline',()=>{const s=placePhotoScene(commonsPhoto(page(),18,'nearby'),'중구','소공동');assert.equal(s.year,1904);assert.ok(photoResearchThumbnail(s.photos[0]));assert.match(s.text,/18m/);assert.match(s.photos[0].values['필수출처표시문구'],/Public domain/);});
test('findPlacePhotos works with fixtures, retries 429, and does not cache total failure',async()=>{
  let calls=0,fail=true;const fetcher=async url=>{calls++;const u=new URL(url);const list=u.searchParams.get('list');
    if(fail)return new Response('busy',{status:429});
    if(list==='geosearch')return Response.json({query:{geosearch:[{pageid:1,title:'File:x',dist:18}]}});
    if(list==='search')return Response.json({query:{search:[]}});
    return Response.json({query:{pages:[page()]}});};
  const r1=await findPlacePhotos(126.9779,37.5663,'중구','소공동',fetcher);assert.equal(r1.photos.length,0);assert.ok(r1.providers.every(p=>!p.ok));
  fail=false;const r2=await findPlacePhotos(126.9779,37.5663,'중구','소공동',fetcher);assert.equal(r2.photos.length,1);assert.equal(r2.photos[0].distance,18);
  const before=calls;await findPlacePhotos(126.9779,37.5663,'중구','소공동',fetcher);assert.equal(calls,before);
});
