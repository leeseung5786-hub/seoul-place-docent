import {env} from 'cloudflare:workers';
import {database,uploadArchiveAsset,requireArchiveAdmin} from '@/lib/archive-db';
import {errorResponse} from '@/lib/providers';
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){try{const actor=requireArchiveAdmin(request,env);return Response.json(await uploadArchiveAsset(database(env),env.BUCKET,(await params).id,request,actor),{status:201,headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
