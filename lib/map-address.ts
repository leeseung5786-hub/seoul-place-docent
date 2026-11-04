import {searchAddresses, ServiceError, type Address, type Candidate, type Secrets} from './providers';

type ReverseAddress = {address_name?: string; region_1depth_name?: string; region_2depth_name?: string; region_3depth_name?: string; mountain_yn?: string; main_address_no?: string; sub_address_no?: string};
type Region = {region_type?: string; code?: string; address_name?: string; region_1depth_name?: string; region_2depth_name?: string; region_3depth_name?: string};
export type MapLocation = {x: number; y: number; address: Address; administrativeDong: string; precision: 'parcel' | 'dong'};
export type MapAddressResult = {location: MapLocation; candidates: Candidate[]; message: string};
const isSeoul = (value?: string) => value === '서울' || value === '서울특별시';
const label = (value = '') => value.replace(/^서울\s/, '서울특별시 ');

export function validateMapPoint(x: number, y: number) {
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 126.7 || x > 127.3 || y < 37.4 || y > 37.8) {
    throw new ServiceError('MAP_POINT', '서울 지도 안에서 위치를 선택해 주세요.', 400);
  }
}
export function parseMapLocation(x: number, y: number, documents: {address?: ReverseAddress; road_address?: {address_name?: string; building_name?: string; zone_no?: string}}[], regions: Region[]): MapLocation {
  validateMapPoint(x, y);
  const legal = regions.find(region => region.region_type === 'B');
  if (!legal || !isSeoul(legal.region_1depth_name) || !/^11\d{8}$/.test(legal.code || '')) {
    throw new ServiceError('OUTSIDE_SEOUL', '현재 서울특별시 안의 위치만 조회할 수 있습니다.', 400);
  }
  const document = documents.find(row => isSeoul(row.address?.region_1depth_name) && row.address?.region_2depth_name === legal.region_2depth_name && row.address?.region_3depth_name === legal.region_3depth_name);
  const parcel = document?.address;
  const hasParcel = !!parcel?.address_name && /^\d{1,4}$/.test(parcel.main_address_no || '') && /^\d{0,4}$/.test(parcel.sub_address_no || '') && ['Y', 'N'].includes(parcel.mountain_yn || '');
  return {x, y, precision: hasParcel ? 'parcel' : 'dong', administrativeDong: regions.find(region => region.region_type === 'H' && isSeoul(region.region_1depth_name))?.region_3depth_name || '',
    address: {roadAddr: document?.road_address?.address_name ? label(document.road_address.address_name) : '',
      jibunAddr: hasParcel ? label(parcel.address_name || '') : label(legal.address_name || ''), siNm: '서울특별시',
      sggNm: legal.region_2depth_name || '', emdNm: legal.region_3depth_name || '', admCd: legal.code!,
      bdMgtSn: '', bdNm: document?.road_address?.building_name || '', lnbrMnnm: hasParcel ? parcel.main_address_no! : '',
      lnbrSlno: hasParcel ? parcel.sub_address_no || '0' : '', mtYn: parcel?.mountain_yn === 'Y' ? '1' : '0', zipNo: document?.road_address?.zone_no || ''}};
}
export function matchMapCandidates(candidates: Candidate[], location: MapLocation) {
  const address = location.address;
  if (location.precision !== 'parcel') return [];
  return candidates.filter(candidate => candidate.admCd === address.admCd && candidate.sggNm === address.sggNm && candidate.emdNm === address.emdNm && candidate.mtYn === address.mtYn
    && Number(candidate.lnbrMnnm) === Number(address.lnbrMnnm) && Number(candidate.lnbrSlno || 0) === Number(address.lnbrSlno || 0));
}
async function localApi<T>(operation: string, x: number, y: number, secret: string) {
  const url = new URL('https://dapi.kakao.com/v2/local/geo/' + operation + '.json');
  url.search = new URLSearchParams({x: String(x), y: String(y), input_coord: 'WGS84'}).toString();
  let response: Response;
  try {response = await fetch(url, {headers: {Authorization: 'KakaoAK ' + secret}, signal: AbortSignal.timeout(12000)});}
  catch {throw new ServiceError('MAP_PROVIDER', '선택한 지점의 주소 조회가 지연되고 있습니다. 다시 선택해 주세요.');}
  if ([401, 403].includes(response.status)) throw new ServiceError('KAKAO_AUTH', '지도 주소 조회의 카카오 API 설정을 확인해야 합니다.');
  if (response.status === 429) throw new ServiceError('KAKAO_QUOTA', '지도 주소 조회 이용 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.', 429);
  if (!response.ok) throw new ServiceError('MAP_PROVIDER', '선택한 지점의 주소를 불러오지 못했습니다.');
  const body = await response.json() as {documents?: unknown};
  if (!Array.isArray(body.documents)) throw new ServiceError('MAP_FORMAT', '지도 주소 응답을 해석하지 못했습니다. 다시 선택해 주세요.');
  return {documents: body.documents as T[]};
}
export async function mapAddress(x: number, y: number, secrets: Secrets): Promise<MapAddressResult> {
  validateMapPoint(x, y);
  if (!secrets.KAKAO_REST_API_KEY) throw new ServiceError('MAP_KEY_MISSING', '지도에서 주소를 선택하기 위한 연결을 준비 중입니다. 주소 검색을 이용해 주세요.', 503);
  const [address, regions] = await Promise.all([localApi<Parameters<typeof parseMapLocation>[2][number]>('coord2address', x, y, secrets.KAKAO_REST_API_KEY), localApi<Region>('coord2regioncode', x, y, secrets.KAKAO_REST_API_KEY)]);
  const location = parseMapLocation(x, y, address.documents || [], regions.documents || []);
  let candidates: Candidate[] = [];
  let message = location.precision === 'dong' ? '이 지점의 지번주소가 제공되지 않아 해당 법정동의 기록을 표시합니다.' : '선택한 지점의 지번주소를 확인했습니다.';
  if (location.precision === 'parcel' && secrets.JUSO_API_KEY) {
    try {
      const result = await searchAddresses(location.address.roadAddr || location.address.jibunAddr, 1, secrets);
      candidates = matchMapCandidates(result.candidates, location);
      if (!candidates.length) message = '선택한 지점의 주소와 동네 기록을 표시합니다. 건물별 정보는 주소 검색으로 추가 확인할 수 있습니다.';
    } catch {message = '선택한 지점의 주소와 동네 기록을 표시합니다. 건물 주소 검색 연결이 지연되고 있습니다.';}
  }
  return {location, candidates, message};
}
