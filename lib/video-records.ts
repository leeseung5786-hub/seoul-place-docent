import packed from '../data/video-workbooks/records-packed.json';
import {readVideoRecordAsset} from '@/lib/video-records-asset';
import type {CatalogRecord,RawVideoRow} from './video-catalog-types';

type DetailShard={records:Record<string,CatalogRecord>;rows:Record<string,RawVideoRow>};
const byVideo:Record<string,string>=packed.byVideo;
// Bound the retained decoded data to one small shard, not the entire archive.
let last:{key:string;value:Promise<DetailShard>}|undefined;
export async function loadVideoRecords(id:string):Promise<DetailShard|null>{
 const key=byVideo[id];if(key===undefined)return null;
 if(last?.key===key)return last.value;
 const value=(async()=>{
  const bytes=new Uint8Array(await readVideoRecordAsset(key));
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return await new Response(stream).json() as DetailShard;
 })();
 last={key,value};
 try{return await value;}catch(error){if(last?.value===value)last=undefined;throw error;}
}
