import {env} from 'cloudflare:workers';
import {database} from '@/lib/archive-db';
import {sourcePassageCorrections} from '@/lib/archive-passage-correction';
import {errorResponse} from '@/lib/providers';
export async function GET(request:Request){try{
 return Response.json(await sourcePassageCorrections(database(env),new URL(request.url).searchParams.get('sourceId')||''),{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e);}}
