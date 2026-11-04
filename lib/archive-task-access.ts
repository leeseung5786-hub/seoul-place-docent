import {ServiceError} from './providers';

/** This route relies on Sites' owner-only hosting policy, including service access.
 * Keep the Site owner-only. Before granting other access, remove this endpoint
 * or introduce separate authorization. Dispatch consumes the service token.
 */
export function requirePrivateTaskAccess(request:Request,ownerEmail?:string){
 const url=new URL(request.url);
 if(url.hostname!=='seoul-place-history.xeonire.chatgpt.site')throw new ServiceError('TASK_HOST','예약 작업은 운영 사이트에서만 실행합니다.',403);
 const origin=request.headers.get('origin');
 if(origin&&origin!==url.origin)throw new ServiceError('ARCHIVE_ORIGIN','이 사이트에서 요청해 주세요.',403);
 const userId=request.headers.get('oai-authenticated-user-id');
 const email=request.headers.get('oai-authenticated-user-email');
 if((userId||email)&&(!userId||!email||!ownerEmail||email.toLowerCase()!==ownerEmail.toLowerCase()))throw new ServiceError('ARCHIVE_FORBIDDEN','예약 작업은 소유자만 실행할 수 있습니다.',403);
 return userId||'scheduled-private-service';
}
