import {env} from '@/lib/runtime-env';
import {database,requireArchiveAdmin,readArchiveJson} from '@/lib/archive-db';
import {importArchiveCaptures} from '@/lib/archive-capture';
import {errorResponse} from '@/lib/providers';
export async function POST(request:Request){try{const actor=requireArchiveAdmin(request,env);return Response.json(await importArchiveCaptures(database(env),await readArchiveJson(request,400000),actor),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
