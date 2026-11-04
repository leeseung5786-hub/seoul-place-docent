import report from '../../../../../data/uploaded-city-history-report-2026-10-20.json';

export function GET(request: Request) {
  const headers: Record<string, string> = {'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff'};
  if (new URL(request.url).searchParams.get('download') === '1') {
    headers['Content-Disposition'] = 'attachment; filename="seoul-city-history-research-2026-10-20.json"';
  }
  return Response.json(report, {headers});
}
