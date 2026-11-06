import {env} from '@/lib/runtime-env';
import {isArchiveAdmin} from '@/lib/archive-db';
export function GET(request:Request){return Response.json({canManage:isArchiveAdmin(request,env)},{headers:{'Cache-Control':'no-store'}});}
