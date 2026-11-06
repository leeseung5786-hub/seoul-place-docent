import {env} from '@/lib/runtime-env';
import {database,addArchivePassage,requireArchiveAdmin,readArchiveJson} from '@/lib/archive-db';
import {errorResponse} from '@/lib/providers';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{const actor=requireArchiveAdmin(request,env);return Response.json(await addArchivePassage(database(env),(await params).id,await readArchiveJson(request),actor),{status:201,headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
