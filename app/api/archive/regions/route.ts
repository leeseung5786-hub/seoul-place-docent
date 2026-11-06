import {env} from '@/lib/runtime-env';
import {database,archiveRegions} from '@/lib/archive-db';
import {errorResponse} from '@/lib/providers';
export async function GET(){try{return Response.json({items:await archiveRegions(database(env))},{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
