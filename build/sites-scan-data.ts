import {fileURLToPath} from 'node:url';
import {readFileSync,statSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
import type {Plugin} from 'vite';
/** Keep pure JSON out of RSC discovery and pack large server data losslessly. */
export function sitesScanData():Plugin{
 const root=fileURLToPath(new URL('../data/',import.meta.url)).replaceAll('\\','/');const prefix='\0sites-packed-data:';
 return {name:'sites-scan-pure-data',apply:'build',enforce:'pre',async resolveId(source,importer){
  if(source.startsWith(prefix))return source;
  if(!source.endsWith('.json'))return;
  const result=await this.resolve(source,importer,{skipSelf:true});const path=result?.id.replaceAll('\\','/');
  if(path?.startsWith(root)&&statSync(path).size>=256*1024)return prefix+path+'.mjs';
 },load(id){
  if(!id.startsWith(prefix))return;const path=id.slice(prefix.length,-4);
  if(this.environment.config.build.write===false)return 'export default {};';
  const text=readFileSync(path,'utf8');JSON.parse(text);
  if(this.environment.name==='client')return 'export default JSON.parse('+JSON.stringify(text)+');';
  const encoded=gzipSync(text,{level:9}).toString('base64');
  return 'import {gunzipSync} from "node:zlib"; import {Buffer} from "node:buffer"; export default JSON.parse(gunzipSync(Buffer.from('+JSON.stringify(encoded)+',"base64")).toString("utf8"));';
 }};
}
