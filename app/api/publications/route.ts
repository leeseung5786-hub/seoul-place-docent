import {env} from 'cloudflare:workers';
import {museumPublications} from '@/lib/place-context';
import {errorResponse} from '@/lib/providers';
export async function GET(request: Request) {
  try {const u = new URL(request.url); return Response.json(await museumPublications(u.searchParams.getAll('q').slice(0, 8), env), {headers: {'Cache-Control': 'no-store'}});}
  catch(e) {return errorResponse(e);}
}
