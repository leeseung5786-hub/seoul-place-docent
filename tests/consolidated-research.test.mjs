import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import videos from '../data/consolidated-video-research.json';
import docs from '../data/document-research/bundle.json';
import {filterResearchVideos} from '../lib/video-research.ts';
import {documentPlaceResearch} from '../lib/document-research.ts';
import {GET} from '../app/api/archive/video-research/route.ts';

test('submitted video groups, exclusions and original report fingerprints remain traceable', () => {
 assert.equal(videos.items.length,204);
 assert.equal(new Set(videos.items.map(item=>item.videoId)).size,204);
 assert.equal(videos.items.filter(item=>item.group==='A').length,128);
 assert.equal(videos.items.filter(item=>item.group==='B').length,76);
 assert.equal(videos.excluded.length,17);
 assert.equal(videos.items.flatMap(item=>item.segments).length,155);
 for(const file of videos.meta.files){const bytes=readFileSync(new URL('../public'+file.path,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),file.sha256);}
});
test('malformed links use only explicit supplied IDs and reversed time ranges are disabled',()=>{
 const recovered=videos.items.find(item=>item.id==='SEOUL-HIST-V-051-021');
 assert.equal(recovered.videoId,'uRVkb4JDXUI');
 assert.match(recovered.title,/1046/);
 for(const item of videos.items){assert.match(item.url,/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]{11}$/);for(const segment of item.segments){if(segment.validTime)assert.ok(segment.start>=0&&segment.end>segment.start);}}
 assert.equal(videos.items.flatMap(item=>item.segments).filter(segment=>!segment.validTime).length,13);
});
test('place filtering needs the same district and dong and never promotes district-only records',()=>{
 const local=filterResearchVideos(videos.items,{district:'성동구',dong:'옥수동',group:'A'});
 assert.ok(local.length);
 assert.ok(local.every(item=>item.regionLinks.some(link=>link.district==='성동구'&&link.dong==='옥수동')));
 assert.equal(filterResearchVideos(videos.items,{district:'성동구',dong:'세곡동'}).length,0);
 assert.equal(filterResearchVideos(videos.items,{district:'부산',dong:'옥수동'}).length,0);
});
test('three imported drafts resolve to their own neighborhood with all evidence references',()=>{
 for(const dong of ['응봉동','하왕십리동','행당동']){
  const result=documentPlaceResearch(docs,'성동구',[dong]);
  assert.equal(result.scope,'legal_dong');assert.equal(result.drafts.length,1);assert.equal(result.drafts[0].values['동·권역명'],dong);
  assert.ok(result.context.claims.every(claim=>!claim.text.includes('](http')));
  assert.equal(result.context.claims.length,15);assert.equal(result.drafts[0].status,'제공자료 초안');
  assert.ok(result.context.claims.every(claim=>claim.sourceIds.length));
 }
 assert.equal(docs.tables.claims.filter(row=>/^E0030(?:6[6-9]|[7-9]\d)$|^E0031(?:0\d|10)$/.test(row.id)).length,45);
});
test('video API paginates candidates separately and exports exclusions only on download',async()=>{
 const query=params=>GET(new Request('https://example.test/api/archive/video-research?'+params));
 const initial=await query('').json();assert.equal(initial.total,128);assert.equal(initial.items.length,12);assert.equal(initial.excluded,undefined);
 const candidates=await query('group=B').json();assert.equal(candidates.total,76);assert.ok(candidates.items.every(item=>item.group==='B'));
 const download=await query('group=all&download=1').json();assert.equal(download.items.length,204);assert.equal(download.excluded.length,17);
 assert.equal(query('group=invalid').status,400);
});
