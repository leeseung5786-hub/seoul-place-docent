import raw from '../../../../data/integrated-research/support.json';
import summary from '../../../../data/integrated-research/summary.json';
import {filterIntegratedResearch, type IntegratedSupport, type IntegratedTable} from '../../../../lib/integrated-research';
const tables = raw as unknown as IntegratedSupport;
const headers = {'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff'};
export function GET(request: Request) {
  const p = new URL(request.url).searchParams;
  if (p.get('mode') === 'summary') return Response.json(summary, {headers});
  const table = (p.get('table') || 'targets') as IntegratedTable;
  if (!['targets', 'links', 'logs', 'excluded', 'idChanges', 'changes'].includes(table)) return Response.json({error: '조사표를 확인해 주세요.'}, {status: 400, headers});
  const rows = filterIntegratedResearch(tables, table, {query: (p.get('q') || '').slice(0, 150),
    district: (p.get('district') || '').slice(0, 20), target: (p.get('target') || '').slice(0, 60),
    source: (p.get('source') || '').slice(0, 100), status: p.get('status') || ''});
  const number = Number(p.get('page') || 1);
  const page = Math.min(Math.max(1, Number.isFinite(number) ? Math.floor(number) : 1), Math.max(1, Math.ceil(rows.length / 20)));
  return Response.json({table, total: rows.length, page, pageSize: 20, rows: rows.slice((page - 1) * 20, page * 20)}, {headers});
}
