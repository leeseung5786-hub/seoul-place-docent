import {env} from 'cloudflare:workers';
import plan from '@/data/history-maintenance-plan.json';
import {archiveStats,database,readArchiveJson} from '@/lib/archive-db';
import {importArchiveCaptures} from '@/lib/archive-capture';
import {requirePrivateTaskAccess} from '@/lib/archive-task-access';
import {listRegionReviews,regionReviewStats,verifyRegionAddress} from '@/lib/archive-region-review';
import {verifyRegionLifecycle,verifyRegionOfficialCode} from '@/lib/archive-region-lifecycle';
import {listPassageReviewTargets,passageReviewStats,reviewArchivePassage} from '@/lib/archive-passage-review';
import {correctArchiveParaphrase} from '@/lib/archive-passage-correction';
import {listOriginalObservations,observeArchiveOriginal} from '@/lib/archive-original-observation';
import {ServiceError,errorResponse} from '@/lib/providers';

export async function GET(request:Request){try{
 requirePrivateTaskAccess(request,env.ARCHIVE_OWNER_EMAIL);
 const db=database(env);
 if(new URL(request.url).searchParams.get('view')==='regions')return Response.json(await listRegionReviews(db),{headers:{'Cache-Control':'no-store'}});
 if(new URL(request.url).searchParams.get('view')==='passages')return Response.json(await listPassageReviewTargets(db,new URL(request.url).searchParams),{headers:{'Cache-Control':'no-store'}});
 if(new URL(request.url).searchParams.get('view')==='original-observations')return Response.json(await listOriginalObservations(db,new URL(request.url).searchParams.get('sourceId')),{headers:{'Cache-Control':'no-store'}});
 const checkpoint=await db.prepare("SELECT * FROM archive_imports WHERE id='scheduled-history-checkpoint'").first();
 return Response.json({plan,checkpoint,stats:await archiveStats(db),regionVerification:await regionReviewStats(db),passageVerification:await passageReviewStats(db)},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e);}}

export async function POST(request:Request){try{
 const actor=requirePrivateTaskAccess(request,env.ARCHIVE_OWNER_EMAIL),db=database(env);
 const body=await readArchiveJson(request,400000);
 if(body?.action==='verify-region-address')return Response.json(await verifyRegionAddress(db,body.payload,actor,env),{headers:{'Cache-Control':'no-store'}});
 if(body?.action==='verify-region-lifecycle')return Response.json(await verifyRegionLifecycle(db,body.payload,actor),{headers:{'Cache-Control':'no-store'}});
 if(body?.action==='verify-region-official-code')return Response.json(await verifyRegionOfficialCode(db,body.payload,actor),{headers:{'Cache-Control':'no-store'}});
 if(body?.action==='review-passage')return Response.json(await reviewArchivePassage(db,body.payload,actor),{headers:{'Cache-Control':'no-store'}});
 if(body?.action==='correct-passage')return Response.json(await correctArchiveParaphrase(db,body.payload,actor),{headers:{'Cache-Control':'no-store'}});
 if(body?.action==='observe-original')return Response.json(await observeArchiveOriginal(db,body.payload,actor),{headers:{'Cache-Control':'no-store'}});
 if(body?.action==='capture')return Response.json(await importArchiveCaptures(db,body.payload,actor),{headers:{'Cache-Control':'no-store'}});
 if(body?.action!=='checkpoint')throw new ServiceError('TASK_ACTION','지원하지 않는 예약 작업입니다.',400);
 const p=body.progress;
 if(!p||typeof p!=='object'||typeof p.phase!=='string'||!plan.phases.some(x=>x.id===p.phase)||typeof p.summary!=='string'||p.summary.length>4000||!Number.isInteger(p.processed)||p.processed<0||typeof p.nextCursor!=='string'||p.nextCursor.length>2000||!['ready','running','completed','blocked'].includes(p.status))throw new ServiceError('TASK_CHECKPOINT','작업 기록을 확인해 주세요.',400);
 const now=new Date().toISOString();
 const note=JSON.stringify({phase:p.phase,summary:p.summary,nextCursor:p.nextCursor,actor});
 await db.prepare("INSERT INTO archive_imports (id,kind,source_url,status,record_count,note,created_at) VALUES ('scheduled-history-checkpoint','scheduled_checkpoint',?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,record_count=excluded.record_count,note=excluded.note,created_at=excluded.created_at").bind(plan.site,p.status,p.processed,note,now).run();
 return Response.json({saved:true,updatedAt:now},{headers:{'Cache-Control':'no-store'}});
}catch(e){return errorResponse(e);}}
