import {env} from 'cloudflare:workers';
import {database,requireArchiveAdmin} from '@/lib/archive-db';
import {seedArchive} from '@/lib/archive-seed';
import {errorResponse} from '@/lib/providers';
export async function POST(request:Request){try{const actor=requireArchiveAdmin(request,env);return Response.json(await seedArchive(database(env),actor),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
