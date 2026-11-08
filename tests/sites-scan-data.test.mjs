import test from 'node:test';import assert from 'node:assert/strict';import {fileURLToPath} from 'node:url';import {readFileSync} from 'node:fs';
import {sitesScanData} from '../build/sites-scan-data.ts';
test('reference discovery skips pure data, server data round-trips losslessly, and clients never require node:zlib',async()=>{
 const plugin=sitesScanData(),path=fileURLToPath(new URL('../data/photo-research/bundle.json',import.meta.url));
 const id=await plugin.resolveId.call({resolve:async()=>({id:path})},'./bundle.json','/importer.ts');assert.ok(id.endsWith('.mjs'));
 const scan={environment:{name:'rsc',config:{build:{write:false}}}},production={environment:{name:'rsc',config:{build:{write:true}}}};
 assert.equal(plugin.load.call(scan,id),'export default {};');assert.equal(plugin.load.call(scan,'/outside/data.json'),undefined);
 const code=plugin.load.call(production,id);assert.ok(code.length<readFileSync(path).length/2);
 const decoded=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 assert.deepEqual(decoded.default,JSON.parse(readFileSync(path,'utf8')));
 const client=plugin.load.call({environment:{name:'client',config:{build:{write:true}}}},id);assert.doesNotMatch(client,/import .*node:zlib/);
});
