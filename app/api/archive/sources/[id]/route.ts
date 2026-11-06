import {env} from '@/lib/runtime-env';
import {database,archiveSourceDetail,saveArchiveSource,requireArchiveAdmin,readArchiveJson} from '@/lib/archive-db';
import {errorResponse} from '@/lib/providers';
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,{params}:Context){try{return Response.json(await archiveSourceDetail(database(env),(await params).id),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
export async function PATCH(request:Request,{params}:Context){try{const actor=requireArchiveAdmin(request,env);const data=await readArchiveJson(request);return Response.json(await saveArchiveSource(database(env),data,actor,(await params).id,data.expectedVersion),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
