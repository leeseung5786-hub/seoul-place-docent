import {env} from '@/lib/runtime-env';
import {database} from '@/lib/archive-db';
import {archiveCoverage} from '@/lib/archive-capture';
import {regionReviewStats} from '@/lib/archive-region-review';
import {errorResponse} from '@/lib/providers';
export async function GET(){try{const db=database(env);return Response.json({...await archiveCoverage(db),regionVerification:await regionReviewStats(db)},{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
