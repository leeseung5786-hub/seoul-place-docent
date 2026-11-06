/** 성북마을아카이브 (archive.sb.go.kr, 성북구청·성북문화원). Only records that carry 공공누리 or CCL are reusable (site policy). */
export const SEONGBUK='https://archive.sb.go.kr';
const decode=(v:string)=>v.replace(/<!--[\s\S]*?-->/g,'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#0?39;/g,"'").replace(/\s+/g,' ').trim();
export function seongbukListUrl(page:number){return `${SEONGBUK}/item?searchType=NAME&page=${page}&size=100&sort=CREATED_AT&direction=DESC&view=list&types=PHOTOGRAPH`;}
export function parseSeongbukList(html:string){return [...new Set([...html.matchAll(/href="\/item\/(\d+)/g)].map(m=>m[1]))];}
export type SeongbukItem={id:string;title:string;description:string;image:string|null;date:string;year:number|null;place:string;creator:string;license:string;access:string;keywords:string[]};
export function parseSeongbukItem(id:string,html:string):SeongbukItem{
  const fields=new Map<string,string>();
  for(const m of html.matchAll(/<span class="tit">([^<]*)<!-- -->:<\/span><em>([\s\S]*?)<\/em>/g))if(!fields.has(m[1]))fields.set(m[1],decode(m[2]));
  const meta=(p:string)=>decode(html.match(new RegExp(`<meta (?:property|name)="${p}" content="([^"]*)"`))?.[1]||'');
  // The 저작권 block repeats "유형" (record type comes first), so read it from its own section.
  const rights=html.match(/>저작권<span[\s\S]*?<\/ul>/)?.[0]||'';
  const rf=new Map<string,string>();for(const m of rights.matchAll(/<span class="tit">([^<]*)<!-- -->:<\/span><em>([\s\S]*?)<\/em>/g))rf.set(m[1],decode(m[2]));
  const date=fields.get('생산시기')||'';const y=date.match(/(?<!\d)(1[89]\d{2}|20[0-2]\d)(?!\d)/);
  const keywords=[...new Set([...html.matchAll(/href="\/item\?searchType=(?:NAME|KEYWORD|SUBJECT|PLACE)[^"]*keyword[^"]*"[^>]*>([^<]+)</g)].map(m=>decode(m[1])))];
  const img=meta('og:image');
  return {id,title:meta('og:title'),description:meta('og:description')||meta('description'),image:/^https:\/\/archive-file\.sb\.go\.kr\//.test(img)?img:null,date,year:y?Number(y[1]):null,place:fields.get('생산지')||'',creator:fields.get('생산자 소속 및 이름')||fields.get('생산기관')||'',license:[rf.get('획득여부'),rf.get('유형')].filter(Boolean).join(' · '),access:fields.get('열람조건')||'',keywords};
}
export function seongbukUsable(i:SeongbukItem){return !!i.image&&!!i.title&&/공공누리|CCL|CC\s?BY|크리에이티브/i.test(i.license)&&!/비공개|제한/.test(i.access);}
