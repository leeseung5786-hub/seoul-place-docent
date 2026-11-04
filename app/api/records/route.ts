import {env} from 'cloudflare:workers';
import {nationalRecords,photoCollections} from '@/lib/archives';
import {errorResponse,ServiceError} from '@/lib/providers';
export async function GET(request:Request){try{const u=new URL(request.url);const provider=u.searchParams.get('provider');if(provider!=='national'&&provider!=='photos')throw new ServiceError('INVALID_PROVIDER','자료원을 선택해 주세요.',400);const query=u.searchParams.get('q')??'';const page=Number(u.searchParams.get('page')??1);return Response.json(await(provider==='national'?nationalRecords(query,page,env):photoCollections(query,page,env)),{headers:{'Cache-Control':'private, no-store'}});}catch(e){return errorResponse(e);}}
