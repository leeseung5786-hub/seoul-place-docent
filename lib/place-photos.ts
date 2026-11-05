import type {PhotoResearchItem} from './photo-research';
import type {StoryScene} from './docent-story';
/** Nearby historical photos from open-licensed sources with clear provenance. Fail-open; presentation only. */
export type PlacePhoto = {id:string;provider:string;title:string;year:number|null;date:string;description:string;imageUrl:string;fullUrl:string;sourceUrl:string;creator:string;license:string;licenseUrl:string|null;distance:number|null;match:'nearby'|'neighborhood'};
export type PlacePhotoResult = {photos:PlacePhoto[];providers:{id:string;name:string;ok:boolean;count:number}[]};
const UA='SeoulPlaceDocent/1.0 (https://github.com/xeonica/seoul-place-docent)';
const COMMONS='https://commons.wikimedia.org/w/api.php';
// Only licences that allow redistribution with attribution (or public domain).
const LICENSE_OK=/^(?:cc[\s-]?by(?:[\s-]sa)?(?:[\s-]\d(?:\.\d)?)?(?:[\s-][a-z]{2,3})?|cc0(?:[\s-]1\.0)?|public domain|pd[\s-]|publicdomain|공공누리|kogl|attribution|no restrictions|copyrighted free use)/i;
const SEOUL={minX:126.7,maxX:127.3,minY:37.4,maxY:37.72};
export function inSeoul(x:number,y:number){return Number.isFinite(x)&&Number.isFinite(y)&&x>=SEOUL.minX&&x<=SEOUL.maxX&&y>=SEOUL.minY&&y<=SEOUL.maxY;}
export function stripHtml(v:unknown){return typeof v==='string'?v.replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#0?39;/g,"'").replace(/\s+/g,' ').trim():'';}
export function parseYear(text:string){const m=text.match(/(?<!\d)(1[89]\d{2}|20[0-2]\d)(?!\d)/);return m?Number(m[1]):null;}
type Meta=Record<string,{value?:unknown}|undefined>;
type Page={pageid?:number;title?:string;imageinfo?:{url?:string;thumburl?:string;descriptionurl?:string;mime?:string;extmetadata?:Meta}[]};
/** Convert one Commons imageinfo page into a photo, or null when rights/format are not clearly acceptable. */
export function commonsPhoto(page:Page,distance:number|null,match:PlacePhoto['match']):PlacePhoto|null{
  const info=page.imageinfo?.[0];if(!info||!page.title||page.pageid==null)return null;
  const meta=info.extmetadata||{};const license=stripHtml(meta.LicenseShortName?.value);
  if(!license||!LICENSE_OK.test(license))return null;
  if(String(meta.NonFree?.value||'').toLowerCase()==='true'||String(meta.Restrictions?.value||'').trim()&&/trademark|personality|insignia|nonfree/i.test(String(meta.Restrictions?.value)))return null;
  const full=info.url||'';const thumb=info.thumburl||full;
  if(!/^https:\/\/upload\.wikimedia\.org\//.test(thumb)||!/^image\/(?:jpeg|png|webp|gif|tiff)$/i.test(info.mime||''))return null;
  const description=stripHtml(meta.ImageDescription?.value);const dateText=stripHtml(meta.DateTimeOriginal?.value)||stripHtml(meta.DateTime?.value);
  const title=page.title.replace(/^File:/,'').replace(/\.[a-z0-9]+$/i,'').replace(/_/g,' ');
  const year=parseYear(dateText)??parseYear(title)??parseYear(description);
  const creator=stripHtml(meta.Artist?.value)||stripHtml(meta.Credit?.value)||'작성자 미상';
  return {id:'pp:commons:'+page.pageid,provider:'Wikimedia Commons',title,year,date:dateText&&dateText.length<40?dateText:year?String(year):'시기 미상',description:description.slice(0,400),imageUrl:thumb,fullUrl:full||thumb,sourceUrl:info.descriptionurl||'https://commons.wikimedia.org/wiki/'+encodeURIComponent(page.title.replace(/ /g,'_')),creator:creator.slice(0,120),license,licenseUrl:/^https?:\/\//.test(stripHtml(meta.LicenseUrl?.value))?stripHtml(meta.LicenseUrl?.value):null,distance,match};
}
async function getJson(url:string,fetcher:typeof fetch,tries=3):Promise<unknown>{
  let last:unknown;
  for(let i=0;i<tries;i++){
    try{const r=await fetcher(url,{headers:{'User-Agent':UA,'Api-User-Agent':UA,Accept:'application/json'}});
      if(r.ok){const d=await r.json() as {error?:unknown};if(!d.error)return d;last=new Error('api error');}
      else if(r.status===429||r.status>=500)last=new Error('HTTP '+r.status);else throw new Error('HTTP '+r.status);
    }catch(e){last=e;}
    if(i<tries-1)await new Promise(res=>setTimeout(res,400*2**i));
  }
  throw last instanceof Error?last:new Error('request failed');
}
async function commonsInfo(ids:number[],fetcher:typeof fetch){
  if(!ids.length)return [] as Page[];
  const params=new URLSearchParams({action:'query',format:'json',formatversion:'2',prop:'imageinfo',pageids:ids.slice(0,50).join('|'),iiprop:'url|extmetadata|mime',iiurlwidth:'900',iiextmetadatafilter:'ImageDescription|DateTimeOriginal|DateTime|Artist|Credit|LicenseShortName|LicenseUrl|NonFree|Restrictions',origin:'*'});
  const d=await getJson(COMMONS+'?'+params,fetcher) as {query?:{pages?:Page[]}};return d.query?.pages||[];
}
export async function commonsNearby(x:number,y:number,fetcher:typeof fetch=fetch,radius=400):Promise<PlacePhoto[]>{
  const g=new URLSearchParams({action:'query',format:'json',formatversion:'2',list:'geosearch',gscoord:`${y}|${x}`,gsradius:String(radius),gslimit:'40',gsnamespace:'6',origin:'*'});
  const d=await getJson(COMMONS+'?'+g,fetcher) as {query?:{geosearch?:{pageid:number;title:string;dist:number}[]}};
  const hits=d.query?.geosearch||[];const dist=new Map(hits.map(h=>[h.pageid,h.dist]));
  const pages=await commonsInfo(hits.map(h=>h.pageid),fetcher);
  return pages.map(p=>commonsPhoto(p,p.pageid!=null?dist.get(p.pageid)??null:null,'nearby')).filter((p):p is PlacePhoto=>!!p);
}
export async function commonsNeighborhood(district:string,dong:string,fetcher:typeof fetch=fetch):Promise<PlacePhoto[]>{
  const s=new URLSearchParams({action:'query',format:'json',formatversion:'2',list:'search',srsearch:`"${dong}" ${district} 서울`,srnamespace:'6',srlimit:'20',origin:'*'});
  const d=await getJson(COMMONS+'?'+s,fetcher) as {query?:{search?:{pageid:number}[]}};
  const pages=await commonsInfo((d.query?.search||[]).map(h=>h.pageid),fetcher);
  return pages.map(p=>commonsPhoto(p,null,'neighborhood')).filter((p):p is PlacePhoto=>!!p);
}
export function rankPhotos(photos:PlacePhoto[],limit=24){
  const seen=new Set<string>();const out:PlacePhoto[]=[];
  for(const p of photos){if(seen.has(p.id))continue;seen.add(p.id);out.push(p);}
  // Older dated photos first (the point is history), then other dated, then nearest.
  out.sort((a,b)=>(a.match===b.match?0:a.match==='nearby'?-1:1)||((a.year!==null&&a.year<=2000?0:1)-(b.year!==null&&b.year<=2000?0:1))||((a.year===null?1:0)-(b.year===null?1:0))||((a.distance??1e9)-(b.distance??1e9))||(a.year??0)-(b.year??0));
  return out.slice(0,limit);
}
const cache=new Map<string,{at:number;value:PlacePhotoResult}>();const TTL=6*3600e3;
export async function findPlacePhotos(x:number,y:number,district:string,dong:string,fetcher:typeof fetch=fetch):Promise<PlacePhotoResult>{
  const key=`${x.toFixed(4)},${y.toFixed(4)}:${district}:${dong}`;const hit=cache.get(key);if(hit&&Date.now()-hit.at<TTL)return hit.value;
  const tasks=[{id:'commons-nearby',name:'Wikimedia Commons · 위치 태그',run:()=>commonsNearby(x,y,fetcher)},{id:'commons-name',name:'Wikimedia Commons · 동네 이름',run:()=>commonsNeighborhood(district,dong,fetcher)}];
  const settled=await Promise.allSettled(tasks.map(t=>t.run()));
  const providers=settled.map((r,i)=>({id:tasks[i].id,name:tasks[i].name,ok:r.status==='fulfilled',count:r.status==='fulfilled'?r.value.length:0}));
  const photos=rankPhotos(settled.flatMap(r=>r.status==='fulfilled'?r.value:[]));
  const value={photos,providers};
  // Do not cache total failure (e.g. rate limiting) so the next visit retries.
  if(providers.some(p=>p.ok))cache.set(key,{at:Date.now(),value});
  return value;
}

/** Wrap a found photo as a story scene so it flows through the same card, timeline and credit UI. */
export function placePhotoScene(p:PlacePhoto,district:string,dong:string):StoryScene{
  const near=p.match==='nearby';
  const item:PhotoResearchItem={id:p.id,batchId:'place-photos',district,dong,dataRow:0,collectionScope:'dong',recordType:'visual',mediaType:'사진',correctionOf:null,correctionIds:[],sourceUrl:p.sourceUrl,sourceKey:p.id,sourceLinkType:'record',previewUrl:p.imageUrl,provider:p.provider,reviewStatus:'자동 수집',relation:near?'근처 위치 태그':'동네 이름 검색',scope:'동',candidate:false,conflictMentioned:false,sameSourceCount:1,samePreviewCount:1,
    values:{'자료명':p.title,'제공기관·채널':p.provider,'촬영자·제작자':p.creator,'필수출처표시문구':`${p.provider} · ${p.creator} · ${p.license}`,'이용조건':`${p.license}${p.licenseUrl?' ('+p.licenseUrl+')':''} — 이용 조건을 지켜 표시합니다.`,'내용설명':p.description,'촬영·제작일':p.date}};
  const where=near?(p.distance!=null?`이 주소에서 약 ${Math.round(p.distance)}m 안에 위치가 표시된 사진이에요.`:'이 주소 근처에 위치가 표시된 사진이에요.'):`‘${dong}’이(가) 언급된 사진이에요.`;
  const text=[p.description,where,'정확한 부지와 일치하는지는 검증되지 않았어요. 출처 페이지에서 확인해 주세요.'].filter(Boolean).join(' ');
  return {id:p.id,kind:'photo',date:p.date,year:p.year,order:p.year===null?Infinity:p.year*10000,title:p.title,text,scope:'dong',photos:[item],cutCount:1,evidence:[{title:p.title,url:p.sourceUrl,institution:p.provider,note:`${p.license} · ${p.creator}`}]};
}
