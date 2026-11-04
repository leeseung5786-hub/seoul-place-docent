import {test} from 'node:test';
import assert from 'node:assert/strict';
import {historicalDate,readingText,groupStoryPhotos,buildDocentStory} from '../lib/docent-story.ts';
import {getDocentStory} from '../lib/docent-data.ts';
import {readPhotoGps} from '../lib/photo-gps.ts';
import {validateSceneTranslations} from '../lib/docent-translation.ts';
test('historical date takes precedence over capture/publication date and keeps uncertainty',()=>{
 assert.equal(historicalDate({'역사적대상시기':'1930년경','촬영·제작일':'2014-01-01','게시·발행일':'2026'}).year,1930);
 assert.equal(historicalDate({'역사적대상시기':'1930년경','촬영·제작일':'1930-01-01'}).label,'1930년경');
 assert.equal(historicalDate({'역사적대상시기':'1968년','촬영·제작일':'1968-07-17'}).order,19680717);
 assert.equal(historicalDate({'역사적대상시기':'미상','게시·발행일':'2026'}).year,null);
 assert.equal(historicalDate({'역사적대상시기':'기원전 30000년'}).year,null);
 assert.ok(historicalDate({'역사적대상시기':'1930년대 후반'}).order>historicalDate({'역사적대상시기':'1934년'}).order);
 assert.ok(historicalDate({'역사적대상시기':'1975년 12월'}).order>historicalDate({'역사적대상시기':'1975년 7월'}).order);
});
const item=(id,sourceUrl,previewUrl=null,type='record')=>({id,sourceUrl,previewUrl,sourceLinkType:type,values:{}});
test('cuts of one museum record and reused previews group; collection pages do not collapse unrelated records',()=>{
 const rows=[item('a','https://museum.seoul.go.kr/view?fileId=A&fileSn=1'),item('b','https://museum.seoul.go.kr/view?fileId=A&fileSn=2'),item('c','https://museum.seoul.go.kr/view?fileId=B&fileSn=1')];assert.deepEqual(groupStoryPhotos(rows).map(r=>r.length),[2,1]);
 assert.equal(groupStoryPhotos([item('d','https://example.org/collection',null,'collection'),item('e','https://example.org/collection',null,'collection')]).length,2);
 assert.equal(groupStoryPhotos([item('a','https://example.org/a','https://example.org/image.jpg'),item('b','https://example.org/b','https://example.org/image.jpg')]).length,1);
});
test('reading text removes evidence markers without removing uncertainty and uses at most three complete sentences',()=>{
 assert.equal(readingText('추정된다[E000366, E000367]. 사진만으로는 확인되지 않아요. 세 번째입니다. 네 번째입니다.'),'추정된다. 사진만으로는 확인되지 않아요. 세 번째입니다.');
});
test('five neighborhoods retain chronological scope; missing records stay empty' ,()=>{
 for(const [gu,dong] of [['성동구','성수동1가'],['서대문구','북아현동'],['종로구','가회동'],['용산구','한강로1가'],['강북구','수유동']]){
  const result=getDocentStory(gu,dong);if(['성수동1가','북아현동','가회동'].includes(dong))assert.ok(result.total>0,gu+' '+dong);assert.ok(result.photoGroups<=result.photoRecords);assert.ok(result.scenes.every(s=>['dong','district'].includes(s.scope)));
  let previous=-Infinity;for(const s of result.scenes){assert.ok(s.order>=previous,s.id);previous=s.order;assert.ok(!/\[E\d+/.test(s.title+s.text));}
  console.log(`${dong}: ${result.photoRecords} photo rows → ${result.photoGroups} groups, ${result.total} scenes`);
 }
});
test('story never includes candidate/conflicting records and district fallback stays district scoped',()=>{
 const a={...item('a','https://example.org/1','https://example.org/a.jpg'),recordType:'visual',candidate:false,conflictMentioned:false,batchId:'district',values:{'역사적대상시기':'1975年'}};
 const photos={meta:{files:[{id:'district',collectionScope:'district',district:'테스트구'}]},items:[a,{...a,id:'candidate',candidate:true},{...a,id:'conflict',conflictMentioned:true}]};
 const docs={targets:[],tables:{timeline:[],claims:[]}};const s=buildDocentStory(photos,docs,'테스트구','테스트동');assert.equal(s.total,1);assert.equal(s.scenes[0].scope,'district');
});
function jpegGps(little=true){
 const buffer=new ArrayBuffer(160),v=new DataView(buffer);v.setUint16(0,0xffd8);v.setUint16(2,0xffe1);v.setUint16(4,156);v.setUint32(6,0x45786966);const t=12;v.setUint16(t,little?0x4949:0x4d4d);const u16=(o,n)=>v.setUint16(t+o,n,little),u32=(o,n)=>v.setUint32(t+o,n,little);u16(2,42);u32(4,8);u16(8,1);u16(10,0x8825);u16(12,4);u32(14,1);u32(18,26);u16(26,4);
 for(const [i,tag,type,cnt,value] of [[0,1,2,2,78],[1,2,5,3,80],[2,3,2,2,69],[3,4,5,3,104]]){const p=28+i*12;u16(p,tag);u16(p+2,type);u32(p+4,cnt);if(type===2)v.setUint8(t+p+8,value);else u32(p+8,value);}
 for(const [base,nums] of [[80,[37,34,0]],[104,[126,58,0]]])nums.forEach((n,i)=>{u32(base+i*8,n);u32(base+i*8+4,1);});return buffer;
}
test('local GPS parser supports both TIFF byte orders and safely rejects no-GPS/malformed files',()=>{
 for(const little of [true,false]){const gps=readPhotoGps(jpegGps(little));assert.ok(Math.abs(gps.y-(37+34/60))<1e-9);assert.ok(Math.abs(gps.x-(126+58/60))<1e-9);}
 assert.equal(readPhotoGps(new ArrayBuffer(5)),null);assert.equal(readPhotoGps(jpegGps().slice(0,90)),null);
});
test('translation validation keeps IDs and years and rejects inserted historical dates',()=>{
 const scene={id:'s',title:'1975년의 거리',text:'사진 속 장소는 미확인입니다.'};assert.equal(validateSceneTranslations({scenes:[{id:'s',title:'The street in 1975',text:'The exact location is unverified.'}]},[scene]).length,1);
 assert.throws(()=>validateSceneTranslations({scenes:[{id:'s',title:'The street in 1980',text:'Unknown.'}]},[scene]));
});
