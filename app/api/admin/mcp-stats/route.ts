import {env} from '@/lib/runtime-env';
import {requireArchiveAdmin} from '@/lib/archive-db';
import {ServiceError} from '@/lib/providers';
import {mcpUsageStats} from '@/lib/mcp-audit';

export const dynamic='force-dynamic';
export async function GET(request:Request) {
 const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
 try {
  requireArchiveAdmin(request,env);
  return Response.json(await mcpUsageStats(env.DB),{headers});
 }catch(error) {
  const forbidden=error instanceof ServiceError&&error.status===403;
  return Response.json({error:forbidden?'관리자 인증이 필요합니다.':'통계를 조회하지 못했습니다.'},{status:forbidden?403:503,headers});
 }
}
