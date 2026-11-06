import {findPlacePhotos,inSeoul} from '@/lib/place-photos';
import {errorResponse,ServiceError} from '@/lib/providers';
const requests=new Map<string,number[]>();const LIMIT_PER_MINUTE=30;
export async function GET(request:Request){try{
 const q=new URL(request.url).searchParams;const hasPoint=q.has('x')&&q.has('y');const x=hasPoint?Number(q.get('x')):null,y=hasPoint?Number(q.get('y')):null;const district=(q.get('district')||'').slice(0,20),dong=(q.get('dong')||'').slice(0,20);
 if((hasPoint&&!inSeoul(x as number,y as number))||!district||!dong)throw new ServiceError('BAD_REQUEST','서울 안의 좌표와 행정구역이 필요합니다.',400);
 const id=request.headers.get('oai-authenticated-user-id')??'private-service';const now=Date.now();const times=(requests.get(id)??[]).filter(t=>now-t<60000);
 if(times.length>=LIMIT_PER_MINUTE)throw new ServiceError('PHOTO_RATE','잠시 후 다시 시도해 주세요.',429);times.push(now);requests.set(id,times);
 return Response.json(await findPlacePhotos(x,y,district,dong),{headers:{'Cache-Control':'public, max-age=3600'}});
}catch(e){return errorResponse(e);}}
