import { env } from 'cloudflare:workers';
import {verifyAddress,buildings,coordinates,floors,errorResponse,ServiceError} from '@/lib/providers';
import {matchRegions} from '@/lib/history';
export async function POST(request:Request){try{if(Number(request.headers.get('content-length')??0)>9000)throw new ServiceError('SIZE','요청이 너무 큽니다.',413);const data=await request.json();if(!data||typeof data!=='object')throw new ServiceError('INVALID_REQUEST','주소 후보를 먼저 선택해 주세요.',400);const {token,buildingId}=data as {token?:unknown;buildingId?:unknown};if(typeof token!=='string')throw new ServiceError('INVALID_TOKEN','주소 후보를 먼저 선택해 주세요.',400);const address=await verifyAddress(token,env);if(buildingId!==undefined){if(typeof buildingId!=='string'||buildingId.length>100)throw new ServiceError('INVALID_BUILDING','건축물 선택을 확인해 주세요.',400);return Response.json(await floors(address,env,buildingId),{headers:{'Cache-Control':'no-store'}});}
 const results=await Promise.allSettled([buildings(address,env),coordinates(address,env)]);
 const safe=(v:PromiseSettledResult<unknown>)=>v.status==='fulfilled'?{status:'ok',data:v.value}:{status:'unavailable',message:v.reason instanceof ServiceError?v.reason.message:'제공기관 자료를 불러오지 못했습니다.'};
 return Response.json({address,history:matchRegions(address.sggNm,address.emdNm),building:safe(results[0]),coordinates:safe(results[1]),queriedAt:new Date().toISOString()},{headers:{'Cache-Control':'no-store'}});
 }catch(e){return errorResponse(e);}}
