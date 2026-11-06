import {env} from '@/lib/runtime-env';
import {closedBuildings, currentParcel, type ContextSection} from '@/lib/place-context';
import {verifyAddress, errorResponse, ServiceError} from '@/lib/providers';
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get('content-length') || 0) > 9000) throw new ServiceError('SIZE', '요청이 너무 큽니다.', 413);
    const body = await request.json() as {token?: unknown};
    if (typeof body?.token !== 'string') throw new ServiceError('INVALID_TOKEN', '주소 후보를 먼저 선택해 주세요.', 400);
    const address = await verifyAddress(body.token, env);
    const results = await Promise.allSettled([closedBuildings(address, env), currentParcel(address, env)]);
    const safe = <T,>(r: PromiseSettledResult<T>): ContextSection<T> => r.status === 'fulfilled' ? {status: 'ok', data: r.value} : {status: 'unavailable', code: r.reason instanceof ServiceError ? r.reason.code : 'CONNECTION_ERROR', message: r.reason instanceof ServiceError ? r.reason.message : '제공기관 연결이 지연되었습니다. 잠시 후 다시 조회해 주세요.'};
    return Response.json({closed: safe(results[0]), parcel: safe(results[1]), queriedAt: new Date().toISOString()}, {headers: {'Cache-Control': 'no-store'}});
  } catch(e) {return errorResponse(e);}
}
