import {env} from '@/lib/runtime-env';
import {database,listArchiveSources,saveArchiveSource,requireArchiveAdmin,readArchiveJson} from '@/lib/archive-db';
import {errorResponse} from '@/lib/providers';
export async function GET(request:Request){try{return Response.json(await listArchiveSources(database(env),new URL(request.url).searchParams),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
export async function POST(request:Request){try{const actor=requireArchiveAdmin(request,env);return Response.json(await saveArchiveSource(database(env),await readArchiveJson(request),actor),{status:201,headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
