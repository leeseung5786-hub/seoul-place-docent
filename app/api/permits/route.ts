import {env} from 'cloudflare:workers';
import {verifyAddress,errorResponse,ServiceError} from '@/lib/providers';
import {queryPermits} from '@/lib/permits';
export async function POST(request:Request){try{const data=await request.json() as {token?:unknown};if(typeof data?.token!=='string')throw new ServiceError('INVALID_TOKEN','주소 후보를 먼저 선택해 주세요.',400);const address=await verifyAddress(data.token,env);return Response.json(await queryPermits(address,env),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
