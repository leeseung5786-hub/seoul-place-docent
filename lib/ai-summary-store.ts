import type {AISummary} from './ai-summary';
/**
 * Persistent cache for generated AI explanations (Cloudflare D1).
 * - The key is a SHA-256 of the model and the evidence text, so any change in the source records
 *   automatically produces a new key (no manual invalidation).
 * - The table is created on first use (CREATE TABLE IF NOT EXISTS), so no separate migration is required.
 * - Every function fails open: when D1 is missing or errors, callers simply generate as before.
 */
export const AI_SUMMARY_TTL_MS=30*24*60*60*1000;
let ready:Promise<void>|null=null;
type Db=D1Database|undefined;
async function ensure(db:D1Database){ready??=db.exec('CREATE TABLE IF NOT EXISTS ai_summary_cache (id TEXT PRIMARY KEY, payload TEXT NOT NULL, created_at INTEGER NOT NULL)').then(()=>undefined);try{await ready;}catch(e){ready=null;throw e;}}
export async function summaryCacheId(key:string){const bytes=new TextEncoder().encode(key);const digest=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');}
export async function readStoredSummary(db:Db,id:string,now=Date.now()):Promise<AISummary|null>{
 if(!db)return null;
 try{await ensure(db);const row=await db.prepare('SELECT payload, created_at FROM ai_summary_cache WHERE id = ?').bind(id).first<{payload:string;created_at:number}>();
  if(!row||now-row.created_at>AI_SUMMARY_TTL_MS)return null;
  const value=JSON.parse(row.payload) as AISummary;return Array.isArray(value.sentences)?{...value,cached:true}:null;}catch{return null;}
}
export async function writeStoredSummary(db:Db,id:string,value:AISummary,now=Date.now()){
 if(!db)return;
 try{await ensure(db);await db.prepare('INSERT OR REPLACE INTO ai_summary_cache (id, payload, created_at) VALUES (?, ?, ?)').bind(id,JSON.stringify({...value,cached:false}),now).run();}catch{/* cache is best-effort */}
}
