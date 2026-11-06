import raw from '../../../../data/consolidated-video-research.json';
import {filterResearchVideos, type ResearchVideo} from '../../../../lib/video-research';
const items = raw.items as ResearchVideo[];
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const filters = {query: (params.get('q') || '').slice(0, 150), district: params.get('district') || '', dong: params.get('dong') || '', group: params.get('group') || 'A'};
  if (!['A', 'B', 'all'].includes(filters.group)) return Response.json({error: '영상 분류를 확인해 주세요.'}, {status: 400});
  if (filters.group === 'all') filters.group = '';
  const rows = filterResearchVideos(items, filters);
  const pageNumber = Number(params.get('page') || 1);
  const page = Math.min(Math.max(1, Number.isFinite(pageNumber) ? Math.floor(pageNumber) : 1), Math.max(1, Math.ceil(rows.length / 12)));
  const download = params.get('download') === '1';
  return Response.json({meta: raw.meta, total: rows.length, page, pageSize: 12, items: download ? rows : rows.slice((page - 1) * 12, page * 12), ...(download ? {excluded: raw.excluded} : {})}, {headers: {'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', ...(download ? {'Content-Disposition': 'attachment; filename="seoul-video-research.json"'} : {})}});
}
