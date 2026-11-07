import {catalogOptions,filterVideoCatalog,videoCatalog,videoDetails,videoRelation} from './video-catalog';
const headers={'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'};
export async function videoCatalogResponse(request:Request){
 const p=new URL(request.url).searchParams;
 const bad=()=>Response.json({error:'영상 검색 조건을 확인해 주세요.'},{status:400,headers});
 if([...p.values()].some(v=>v.length>200))return bad();
 const id=p.get('id');
 if(id){if(!/^video-[a-f0-9]{20}$/.test(id))return bad();const details=await videoDetails(id);return details?Response.json(details,{headers}):Response.json({error:'자료가 없습니다.'},{status:404,headers});}
 const district=p.get('district')||'',dong=p.get('dong')||'',period=p.get('period')||'',status=p.get('status')||'',source=p.get('source')||'';
 const options=catalogOptions();
 if(district&&!options.districts.includes(district)||period&&!['before1900','1900-1944','1945-1999','from2000','unknown'].includes(period)||status&&!['pending','held'].includes(status)||source&&!['workbooks','legacy'].includes(source))return bad();
 const page=Number(p.get('page')||1),pageSize=Number(p.get('limit')||12);
 if(!Number.isInteger(page)||page<1||!Number.isInteger(pageSize)||pageSize<1||pageSize>24)return bad();
 const place=p.get('mode')==='place';
 const rows=filterVideoCatalog(videoCatalog.items,{query:p.get('q')||'',district,dong,period,status,source,provider:p.get('provider')||'',place});
 const current=Math.min(page,Math.max(1,Math.ceil(rows.length/pageSize)));
 const items=rows.slice((current-1)*pageSize,current*pageSize).map(({refs,...item})=>({...item,sourceRowCount:refs.length,...(place&&district?{relation:videoRelation({...item,refs},district,dong)}:{})}));
 return Response.json({meta:videoCatalog.meta,total:rows.length,page:current,pageSize,items,options,files:videoCatalog.files}, {headers});
}
