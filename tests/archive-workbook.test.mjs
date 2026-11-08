import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {photoResearchBundle} from '../lib/photo-research-data.ts';
import {filterPhotoResearch} from '../lib/photo-research.ts';
import {archiveWorkbookStatus} from '../lib/archive-workbook.ts';

const audit=JSON.parse(readFileSync(new URL('../data/archive-workbook/audit.json',import.meta.url)));
const rows=new Map(photoResearchBundle.items.map(row=>[row.id,row]));
test('every workbook photo observation resolves to an active record with unchanged source fields',()=>{
  assert.equal(audit.photoRowsMapped,1115+1153);
  for(const link of audit.mappings){
    const row=rows.get(link.recordId);assert.ok(row,link.recordId);
    const values=Object.fromEntries(Object.entries(row.values).filter(([k])=>!['연번','원본조사파일'].includes(k)).map(([k,v])=>[k,String(v??'').trim()]));
    // Fingerprints use the workbook column set, excluding unrelated existing fields.
    const headers=['조사묶음ID','자료ID','매체유형','자료명','제공기관·채널','촬영자·제작자','원문URL','기관자료ID','자치구','원문장소표기','관련주소ID','공간범위','주소관계상태','주소관계근거','역사적대상시기','촬영·제작일','게시·발행일','내용설명','선정이유','이용조건','이용조건근거URL','이용조건확인내용','원본보관가능여부','사이트표시가능여부','썸네일표시가능여부','임베드가능여부','변형이용가능여부','검토상태','확인일','추가확인사항','사진유형','원본파일URL','미리보기URL','파일형식','해상도','촬영방향·위치','확인가능한지형·시설','원문설명과조사자관찰구분','비교가능한현재대상','사이트용캡션초안','필수출처표시문구','파일확보상태'];
    const canonical='{'+headers.sort().map(k=>JSON.stringify(k)+': '+JSON.stringify(values[k]||'')).join(', ')+'}';
    assert.equal(createHash('sha256').update(canonical).digest('hex'),link.fingerprint,link.sourceId);
  }
});
test('new Dongdaemun records are searchable and attached to their documented neighborhood',()=>{
  for(const dong of ['신설동','용두동','제기동','전농동','답십리동','장안동','청량리동','회기동','휘경동','이문동']){
    const files=photoResearchBundle.meta.files.filter(f=>f.district==='동대문구'&&f.dong===dong);
    assert.ok(files.length,dong);
    const ids=new Set(files.map(f=>f.id));
    assert.ok(photoResearchBundle.items.some(r=>ids.has(r.batchId)),dong);
  }
  assert.ok(filterPhotoResearch(photoResearchBundle,{query:'BONGWONDONG-SEODAEMUNGU-001-P025'}).length);
  assert.equal(rows.size,photoResearchBundle.items.length);
  assert.equal(photoResearchBundle.meta.recordCount,photoResearchBundle.items.length);
  assert.equal(archiveWorkbookStatus.videoRows,3740);
  assert.equal(archiveWorkbookStatus.newPhotoIds,549);
  assert.equal(archiveWorkbookStatus.preservedVariants,38);
});
