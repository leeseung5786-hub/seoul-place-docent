import {env} from '@/lib/runtime-env';
import {database,archiveStats} from '@/lib/archive-db';
import {errorResponse} from '@/lib/providers';
export async function GET(){try{return Response.json(await archiveStats(database(env)),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
