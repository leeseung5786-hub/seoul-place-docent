import {env} from '@/lib/runtime-env';
import {publicMcpUrl} from '@/lib/mcp-connection';
export function GET(){
 return Response.json({serverUrl:publicMcpUrl(env.MCP_PUBLIC_URL),note:'Sites 홈페이지 공개와 MCP 인증은 별개입니다. 별도 공개 MCP 주소를 사용하세요.'},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
