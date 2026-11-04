import {env} from 'cloudflare:workers';
import {mapAddress} from '@/lib/map-address';
import {errorResponse, ServiceError} from '@/lib/providers';
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    if (!params.get('x')?.trim() || !params.get('y')?.trim()) throw new ServiceError('MAP_POINT', '지도에서 위치를 먼저 선택해 주세요.', 400);
    return Response.json(await mapAddress(Number(params.get('x')), Number(params.get('y')), env), {headers: {'Cache-Control': 'no-store'}});
  } catch (error) {return errorResponse(error);}
}
