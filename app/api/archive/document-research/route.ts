import raw from '../../../../data/document-research/bundle.json';
import {documentContext, documentPlaceResearch, documentTables, filterDocumentRows, isDocumentTable, type DocumentBundle, type DocumentFilters} from '../../../../lib/document-research';

const bundle = raw as unknown as DocumentBundle;
const headers = {'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff'};
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (params.get('mode') === 'place') {
    const district = params.get('district') || '';
    if (!bundle.targets.some(t => t.level === '자치구' && t.district === district)) return Response.json({error: '서울 자치구를 선택해 주세요.'}, {status: 400, headers});
    return Response.json(documentPlaceResearch(bundle, district, params.getAll('dong').slice(0, 20)), {headers});
  }
  const table = params.get('table') || 'drafts';
  if (!isDocumentTable(table)) return Response.json({error: '조사자료 표를 확인해 주세요.'}, {status: 400, headers});
  const filters: DocumentFilters = {
    query: (params.get('q') || '').slice(0, 150), district: params.get('district') || '', target: params.get('target') || '',
    source: params.get('source') || '', evidence: params.get('evidence') || '', id: params.get('id') || '', issuesOnly: params.get('issues') === '1',
  };
  if (filters.target && !bundle.targets.some(t => t.id === filters.target)) return Response.json({error: '조사대상 ID를 확인해 주세요.'}, {status: 400, headers});
  const rows = filterDocumentRows(bundle, table, filters);
  const pageValue = Number(params.get('page') || 1);
  const page = Math.min(Math.max(1, Number.isFinite(pageValue) ? Math.floor(pageValue) : 1), Math.max(1, Math.ceil(rows.length / 20)));
  const download = params.get('download') === '1';
  const visible = download ? rows : rows.slice((page - 1) * 20, page * 20);
  const counts = Object.fromEntries(documentTables.map(key => [key, filterDocumentRows(bundle, key, {...filters, id: ''}).length]));
  return Response.json({table, total: rows.length, page, pageSize: 20, rows: visible, counts, context: documentContext(bundle, visible),
    ...(download ? {provenance: bundle.meta, filters} : {})}, {headers: {...headers,
    ...(download ? {'Content-Disposition': `attachment; filename="seoul-history-doc-${table}.json"`} : {})}});
}
