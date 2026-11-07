import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';
import {sitesNativeRuntime} from '../build/sites-native-runtime.ts';
test('Cloudflare runtime selection survives tsconfig path resolution and query suffixes',()=>{
 const p=sitesNativeRuntime();
 const id=fileURLToPath(new URL('../lib/runtime-env.ts',import.meta.url));
 for(const path of [id,id+'?rsc']){
  const result=p.transform('NODE_ONLY',path);
  assert.match(result.code,/cloudflare:workers/);assert.doesNotMatch(result.code,/NODE_ONLY|process.env/);
 }
 assert.equal(p.transform('keep','/unrelated/runtime-env.ts'),null);
});
test('Sites reads provenance through ASSETS while native Next keeps its filesystem loader',()=>{
 const p=sitesNativeRuntime();const id=fileURLToPath(new URL('../lib/video-records-asset.ts',import.meta.url));
 const result=p.transform('NODE_ONLY',id);
 assert.match(result.code,/env.ASSETS.fetch/);assert.doesNotMatch(result.code,/node:fs|readFile/);
 assert.match(readFileSync(id,'utf8'),/node:fs\/promises/);
});
