import {env} from '@/lib/runtime-env';
import {generateAISummary} from '@/lib/ai-summary';
import {verifyAddress,errorResponse,ServiceError} from '@/lib/providers';
const requests=new Map<string,number[]>();
const LIMIT_PER_MINUTE=10;
export async function POST(request:Request){try{
 if(Number(request.headers.get('content-length')??0)>9000)throw new ServiceError('SIZE','요청이 너무 큽니다.',413);
 const id=request.headers.get('oai-authenticated-user-id')??'private-service';
 // Only fresh OpenAI generations count toward the limit; answers served from the stored cache are free.
 const beforeRequest=()=>{const now=Date.now();const times=(requests.get(id)??[]).filter(t=>now-t<60000);if(times.length>=LIMIT_PER_MINUTE)throw new ServiceError('AI_RATE_LIMIT','AI 설명을 새로 만드는 요청이 많아 잠시 후 다시 시도해 주세요.',429);times.push(now);requests.set(id,times);};
 const d=await request.json() as {token?:unknown;regionId?:unknown;buildingId?:unknown;refresh?:unknown};const options={refresh:d?.refresh===true,beforeRequest};if(!d||typeof d!=='object')throw new ServiceError('AI_INPUT','주소 또는 수록된 동네를 선택해 주세요.',400);
 if(d.buildingId!==undefined&&(typeof d.buildingId!=='string'||d.buildingId.length>100))throw new ServiceError('AI_BUILDING','건축물 선택을 확인해 주세요.',400);
 const result=typeof d.token==='string'?await generateAISummary({address:await verifyAddress(d.token,env),buildingId:d.buildingId as string|undefined},env,options):typeof d.regionId==='string'?await generateAISummary({regionId:d.regionId},env,options):null;
 if(!result)throw new ServiceError('AI_INPUT','주소 또는 수록된 동네를 선택해 주세요.',400);
 return Response.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch(e){return errorResponse(e);}}
