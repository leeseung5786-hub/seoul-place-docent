import { env } from 'cloudflare:workers';
import { searchAddresses,errorResponse } from '@/lib/providers';
export async function GET(request:Request){try{const url=new URL(request.url);return Response.json(await searchAddresses((url.searchParams.get('q')??'').trim(),Number(url.searchParams.get('page')??1),env),{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
