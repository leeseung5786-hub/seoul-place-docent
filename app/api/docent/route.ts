import {getDocentStory} from '@/lib/docent-data';
import {errorResponse} from '@/lib/providers';
export function GET(request:Request){try{const p=new URL(request.url).searchParams;return Response.json(getDocentStory(p.get('district')||'',p.get('dong')||'',(p.get('focus')||'').split(',').map(x=>x.trim().slice(0,30)).filter(Boolean).slice(0,3)),{headers:{'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});}catch(e){return errorResponse(e);}}
