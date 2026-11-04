import {checkedFetch,ServiceError,parcelParams} from './providers';
import {readProviderXml} from './archives';
import type {Address} from './providers';
export type PermitSecrets={PERMIT_API_KEY?:string};
export type PermitRecord={id:string;name:string;kind:string;use:string;lotAddress:string;permitDate:string;startDate:string;approvalDate:string;demolitionDate:string;createdDate:string;scope:'같은 지번의 행정기록';relation:string};
const field=(x:Record<string,unknown>,k:string)=>String(x[k]??'').trim();
export function normalizePermitRows(body:Record<string,any>,address:Address,kind:string){
 if(!['00','0'].includes(String(body.response?.header?.resultCode)))throw new ServiceError('PERMIT_PROVIDER','건축인허가 조회에 실패했습니다. 해당 서비스 활용신청·인증 상태를 확인해야 합니다.');
 const raw=body.response.body?.items?.item;const rows:Record<string,unknown>[]=Array.isArray(raw)?raw:raw&&typeof raw==='object'?[raw]:[];const p=parcelParams(address);
 return rows.filter(x=>field(x,'sigunguCd')===p.sigunguCd&&field(x,'bjdongCd')===p.bjdongCd&&field(x,'bun').padStart(4,'0')===p.bun&&field(x,'ji').padStart(4,'0')===p.ji&&field(x,'platGbCd')===p.platGbCd).map(x=>({id:field(x,'mgmPmsrgstPk'),name:field(x,'bldNm'),kind:field(x,'archGbCdNm')||field(x,'demolExtngGbCdNm')||field(x,'imprprGbCdNm')||kind,use:field(x,'mainPurpsCdNm'),lotAddress:field(x,'platPlc'),permitDate:field(x,'archPmsDay'),startDate:field(x,'realStcnsDay'),approvalDate:field(x,'useAprDay'),demolitionDate:field(x,'demolExtngDay')||field(x,'demolEndDay'),createdDate:field(x,'crtnDay'),scope:'같은 지번의 행정기록' as const,relation:'현재 지번 식별정보 일치 · 현재 건물과 동일 여부 및 옛 필지 경계는 미검증'}));
}
export async function queryPermits(address:Address,secrets:PermitSecrets){
 if(!secrets.PERMIT_API_KEY)throw new ServiceError('KEY_MISSING','건축인허가 연결을 준비 중입니다.',503);
 const operations=[['basic','기본 인허가','getApBasisOulnInfo'],['repair','대수선','getApImprprInfo'],['demolition','철거·멸실','getApDemolExtngMgmRgstInfo']];
 const sections=await Promise.all(operations.map(async([id,title,op])=>{try{const items:PermitRecord[]=[];let total=0,page=1;do{const u=new URL(`https://apis.data.go.kr/1613000/ArchPmsHubService/${op}`);Object.entries({...parcelParams(address),serviceKey:secrets.PERMIT_API_KEY!,numOfRows:'100',pageNo:String(page),_type:'xml'}).forEach(([k,v])=>u.searchParams.set(k,v));const response=await checkedFetch(u);let body:Record<string,any>;try{body=readProviderXml(await response.text());}catch{throw new ServiceError('PERMIT_FORMAT','건축인허가 응답을 해석하지 못했습니다. 해당 서비스 인증·활용신청 상태를 확인해 주세요.');}items.push(...normalizePermitRows(body,address,title));total=Number(body.response.body?.totalCount??0);page++;}while((page-1)*100<total&&page<=3);return {id,title,status:'ok',items,total,truncated:total>300};}catch(e){return {id,title,status:'unavailable',items:[],total:0,truncated:false,message:e instanceof ServiceError?e.message:'자료 제공기관과 연결되지 않았습니다.'};}}));
 return {sections,queriedAt:new Date().toISOString(),sourceUrl:'https://www.data.go.kr/data/15136267/openapi.do',relation:'같은 지번의 행정기록 · 현재 건물과 동일 여부 미검증'};
}
