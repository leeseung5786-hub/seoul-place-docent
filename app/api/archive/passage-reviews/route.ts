import {env} from 'cloudflare:workers';
import {database} from '@/lib/archive-db';
import {sourcePassageReviews} from '@/lib/archive-passage-review';
import {errorResponse} from '@/lib/providers';

export async function GET(request:Request){try{
 return Response.json(await sourcePassageReviews(database(env),new URL(request.url).searchParams.get('sourceId')||''),{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e);}}
