import raw from '../data/video-workbooks/index.json';
import pdfReferences from '../data/video-workbooks/pdf-references.json';
import {loadVideoRecords} from './video-records';

import type {CatalogVideo,VideoSource,VideoRelation,CatalogRecord,RawVideoRow} from './video-catalog-types';
export const videoCatalog={...raw,items:raw.items as CatalogVideo[],files:raw.files as VideoSource[]};

export function videoRelation(item:CatalogVideo,district:string,dong:string):VideoRelation|null {
 const links=item.regionLinks.filter(l=>l.district===district);
 if(dong&&links.some(l=>l.legalDongs.includes(dong)))return 'legal_dong_candidate';
 if(dong&&links.some(l=>l.mentionedDongs.includes(dong)))return 'place_candidate';
 if(links.length)return 'district_background';
 if(item.regionLinks.some(l=>!l.district))return 'seoul_background';
 return null;
}
const normalized=(v:string)=>v.normalize('NFKC').toLowerCase();
export function filterVideoCatalog(items:CatalogVideo[],filters:{query?:string;district?:string;dong?:string;period?:string;provider?:string;status?:string;source?:string;place?:boolean}) {
 const terms=normalized(filters.query||'').trim().split(/\s+/).filter(Boolean);
 const results=items.filter(item=>{
  if(filters.provider&&!item.providers.includes(filters.provider))return false;
  if(filters.status&&item.reviewStatus!==filters.status)return false;
  if(filters.source&&item.source!==filters.source&&item.source!=='both')return false;
  if(filters.district){
   if(filters.place){if(!videoRelation(item,filters.district,filters.dong||''))return false;}
   else if(!item.regionLinks.some(l=>l.district===filters.district&&(!filters.dong||l.legalDongs.includes(filters.dong)||l.administrativeDong===filters.dong||l.mentionedDongs.includes(filters.dong)||l.place.includes(filters.dong))))return false;
  }else if(filters.dong&&!item.regionLinks.some(l=>[...l.legalDongs,...l.mentionedDongs,l.administrativeDong,l.place].some(v=>v.includes(filters.dong!))))return false;
  // Period filters use historical subject labels only, never upload/production dates.
  const years=item.historicalPeriods.flatMap(p=>[...p.matchAll(/(?:1[0-9]|20)\d{2}/g)].map(m=>Number(m[0])));
  if(filters.period==='unknown'&&years.length)return false;
  if(filters.period&&filters.period!=='unknown'){
   const [from,to]=filters.period==='before1900'?[0,1899]:filters.period==='1900-1944'?[1900,1944]:filters.period==='1945-1999'?[1945,1999]:[2000,2099];
   if(!years.some(y=>y>=from&&y<=to))return false;
  }
  const haystack=normalized([item.title,item.description,item.channel,...item.originalIds,...item.providers,...item.historicalPeriods,...item.regionLinks.flatMap(l=>[l.district,l.administrativeDong,l.place,...l.legalDongs,...l.mentionedDongs])].join(' '));
  return terms.every(t=>haystack.includes(t));
 });
 if(filters.place&&filters.district){const order:Record<VideoRelation,number>={legal_dong_candidate:0,place_candidate:1,district_background:2,seoul_background:3};results.sort((a,b)=>order[videoRelation(a,filters.district!,filters.dong||'')!]-order[videoRelation(b,filters.district!,filters.dong||'')!]);}
 return results;
}
export function catalogOptions(){return {districts:Object.keys(videoCatalog.meta.districtRows).filter(Boolean).sort(),providers:[...new Set(videoCatalog.items.flatMap(i=>i.providers))].sort()};}
export async function videoDetails(id:string){
 const item=videoCatalog.items.find(i=>i.id===id);if(!item)return null;
 const data=await loadVideoRecords(id);
 if(!data)throw new Error('Video provenance shard is missing');
 const records=item.refs.map(ref=>data.records[ref]);
 const refs=[...new Set(records.flatMap(r=>[r.ref,...r.supportingRefs]))];
 const rows=refs.map(ref=>data.rows[ref]).filter(Boolean);
 const references=pdfReferences.references.filter(r=>r.videoId===id);
 return {item,records,rows,references,sheets:videoCatalog.sheets.filter(s=>rows.some(r=>r.fileId===s.fileId&&r.sheet===s.sheet)),files:videoCatalog.files.filter(f=>rows.some(r=>r.fileId===f.id)||references.some(r=>r.fileId===f.id))};
}
