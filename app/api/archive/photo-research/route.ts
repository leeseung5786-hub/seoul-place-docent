import {photoResearchBundle as bundle} from '../../../../lib/photo-research-data';
import {filterPhotoResearch, placePhotoResearch, type PhotoResearchFilters} from '../../../../lib/photo-research';
const headers = {'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff'};
export function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  if (p.get('mode') === 'place') return Response.json(placePhotoResearch(bundle, (p.get('district') || '').slice(0, 20), p.getAll('dong').slice(0, 20), Number(p.get('visualPage') || 1)), {headers});
  const batch = p.get('batch') || '';
  if (batch && !bundle.meta.files.some(f => f.id === batch)) return Response.json({error: '사진 조사묶음을 확인해 주세요.'}, {status: 400, headers});
  const filters: PhotoResearchFilters = {
    query: (p.get('q') || '').slice(0, 150), district: p.get('district') || '', batch,
    provider: p.get('provider') || '', scope: p.get('scope') || '', source: p.get('source') || '', id: bundle.meta.integratedResearch?.idAliases[p.get('id') || ''] || p.get('id') || '',
    review: p.get('review') || '', previewOnly: p.get('preview') === '1', repeatsOnly: p.get('repeats') === '1', conflictsOnly: p.get('conflicts') === '1',
    recordType: p.get('type') || '', mediaType: p.get('media') || '',
    dong: (p.get('dong') || '').slice(0, 30), target: (p.get('target') || '').slice(0, 60),
  };
  const rows = filterPhotoResearch(bundle, filters);
  const pageValue = Number(p.get('page') || 1);
  const page = Math.min(Math.max(1, Number.isFinite(pageValue) ? Math.floor(pageValue) : 1), Math.max(1, Math.ceil(rows.length / 20)));
  const download = p.get('download') === '1';
  return Response.json({total: rows.length, page, pageSize: 20, rows: download ? rows : rows.slice((page - 1) * 20, page * 20),
    sourceUrlCount: new Set(rows.filter(r => r.sourceUrl).map(r => r.sourceUrl)).size,
    candidateCount: rows.filter(r => r.candidate).length,
    ...(download ? {provenance: bundle.meta, filters} : {})}, {headers: {...headers,
    ...(download ? {'Content-Disposition': 'attachment; filename="seoul-neighborhood-photo-research.json"'} : {})}});
}
