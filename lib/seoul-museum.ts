/** 서울역사박물관 서울역사아카이브 (museum.seoul.go.kr/archive). Each item states its own 공공누리 type on its page. */
export const MUSEUM='https://museum.seoul.go.kr';
const decode=(v:string)=>v.replace(/<!H[SE]>/g,'').replace(/<br\s*\/?>/gi,' ').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#0?39;/g,"'").replace(/\s+/g,' ').trim();
export type MuseumHit={fileId:string;fileSn:string;ctgryId:string;type:string;upperNodeId:string};
/** Photo collections only (maps and future-heritage records are left out). */
export const MUSEUM_COLLECTIONS=['archive','seoulPicture','cultureData','excavationRecord'] as const;
export function museumSearchUrl(query:string,collection:string,page=1){return `${MUSEUM}/archive/search/NR_search.do?collection=${collection}&q_rowPerPage=100&currentPage=${page}&query=${encodeURIComponent(query)}`;}
export function parseMuseumSearch(html:string):MuseumHit[]{
  const out=new Map<string,MuseumHit>();
  for(const m of html.matchAll(/NR_archiveView\.do\?ctgryId=(CTGRY\d+)&(?:amp;)?type=([A-Z])&(?:amp;)?upperNodeId=(CTGRY\d+)&(?:amp;)?fileSn=(\d+)&(?:amp;)?fileId=([A-Za-z0-9-]+)/g))
    if(!out.has(m[5]))out.set(m[5],{ctgryId:m[1],type:m[2],upperNodeId:m[3],fileSn:m[4],fileId:m[5]});
  return [...out.values()];
}
export function museumViewUrl(h:MuseumHit){return `${MUSEUM}/archive/archiveNew/NR_archiveView.do?ctgryId=${h.ctgryId}&type=${h.type}&upperNodeId=${h.upperNodeId}&fileSn=${h.fileSn}&fileId=${h.fileId}`;}
/** Same form as the team's research data, so duplicates group together. */
export function museumThumb(h:Pick<MuseumHit,'fileSn'|'fileId'>){return `${MUSEUM}:8088/component/archv/data/ND_thumbnail.tmb?fileSn=${h.fileSn}&fileId=${h.fileId}&w=800&h=800`;}
const cell=(html:string,label:string)=>{const m=html.match(new RegExp(`<th>\\s*<strong>${label}</strong>\\s*</th>\\s*<td>([\\s\\S]*?)</td>`));return m?decode(m[1]):'';};
export type MuseumItem={title:string;date:string;year:number|null;place:string;description:string;source:string;kogl:number|null;media:string};
export function parseMuseumItem(html:string):MuseumItem{
  const date=cell(html,'시기')||cell(html,'제작시기')||cell(html,'조사일');const y=date.match(/(?<!\d)(1[5-9]\d{2}|20[0-2]\d)(?!\d)/);
  const kogl=html.match(/class="opencode_box koglCode(\d)"/);
  return {title:cell(html,'명칭')||cell(html,'제목'),date,year:y?Number(y[1]):null,place:cell(html,'장소')||cell(html,'조사지역')||cell(html,'지역'),description:cell(html,'내용')||cell(html,'설명'),source:cell(html,'자료출처'),kogl:kogl?Number(kogl[1]):null,media:cell(html,'자료형태')};
}
/** 공공누리 1~4유형 all allow showing the unmodified work with attribution. */
// Excavated artifacts ("459. 청자…") and architectural drawings are not pictures of the place.
export function museumUsable(i:MuseumItem){return !!i.title&&i.kogl!==null&&i.kogl>=1&&i.kogl<=4&&!/문서|텍스트|영상|음향/.test(i.media)&&!/^\d+\.\s/.test(i.title)&&!/(?:평면|입면|단면|배치|실측|투시|노선|분포|현황)도|도면|탁본|편$|비율|현황|통계|그래프|도표|목록|분포|위치도|지도/.test(i.title);}
export const KOGL_LABEL:Record<number,string>={1:'공공누리 제1유형(출처표시)',2:'공공누리 제2유형(출처표시·상업적 이용금지)',3:'공공누리 제3유형(출처표시·변경금지)',4:'공공누리 제4유형(출처표시·상업적 이용금지·변경금지)'};
