import {archiveWorkbookStatus} from '../../../../lib/archive-workbook';
export function GET() {
  return Response.json(archiveWorkbookStatus, {headers: {'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff'}});
}
