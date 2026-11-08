import test from 'node:test';
import assert from 'node:assert/strict';
import {verifiedVideoSegments,getDocentVideoCandidates} from '../lib/docent-videos.ts';
test('unverified, inverted and nonfinite times never become verified playback links',()=>{
 const segment={start:12,end:25,validTime:true,verifiedTime:false,ref:'fixture',place:'동네',description:'장면'};
 const url='https://www.youtube.com/watch?v=fixture';
 assert.deepEqual(verifiedVideoSegments([segment],url),[]);
 assert.equal(verifiedVideoSegments([{...segment,verifiedTime:true}],url)[0].url,url+'&t=12s');
 for(const change of [{end:1},{start:-1},{start:NaN},{end:Infinity},{validTime:false}])assert.deepEqual(verifiedVideoSegments([{...segment,verifiedTime:true,...change}],url),[]);
});
test('actual catalog provenance remains available without model or network calls',async()=>{
 const saved=globalThis.fetch;globalThis.fetch=async()=>{throw Error('network forbidden');};
 try{const p=await getDocentVideoCandidates('성동구','마장동');assert.ok(p.records.length>0&&p.records.length<=3);assert.ok(p.records.every(i=>i.sources.length&&i.buildingMatch==='unverified'&&i.segmentStatus!=='unavailable'));}finally{globalThis.fetch=saved;}
});
