import {env} from '@/lib/runtime-env';
import {auditReceiver} from '@/lib/mcp-audit-receiver';
export const dynamic='force-dynamic';
export const POST=auditReceiver(env);
