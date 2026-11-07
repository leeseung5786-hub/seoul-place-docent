import {isObject,MCP_VERSION,MCP_SUPPORTED_VERSIONS,rpcError} from './mcp-protocol';

export const mcpHeaders={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export function originError(request:Request) {
 const origin=request.headers.get('origin');
 if(origin&&origin!==new URL(request.url).origin)return Response.json(rpcError(null,-32600,'Origin not allowed'),{status:403,headers:mcpHeaders});
}
// Instance-wide bound: no stored IP/identity and no spoofable per-user quota.
// Multi-instance/global abuse limits must additionally be configured at the edge.
export function createMcpLimiter(limit=120,windowMs=60000) {
 let start=0,count=0;
 return (now=Date.now())=>{if(now-start>=windowMs){start=now;count=0;}return ++count<=limit;};
}
export const allowMcpRequest=createMcpLimiter();
export function acceptError(request:Request) {
 const accepted=(request.headers.get('accept')||'').toLowerCase().split(',').filter(part=>! /;\s*q=0(?:\.0*)?(?:\s*;|\s*$)/.test(part)).map(part=>part.split(';')[0].trim());
 if(!accepted.includes('application/json')||!accepted.includes('text/event-stream'))return Response.json(rpcError(null,-32600,'Accept must include application/json and text/event-stream'),{status:406,headers:mcpHeaders});
}
function decodeName(value:string|null) {
 if(value===null)return null;
 if(!/^[\x20-\x7e\t]*$/.test(value))return null;
 if(value.startsWith('=?base64?')&&value.endsWith('?=')) {
  try {return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(value.slice(9,-2)),c=>c.charCodeAt(0)));}catch{return null;}
 }
 return value;
}
export function protocolError(request:Request,message:unknown) {
 const id=isObject(message)&&(typeof message.id==='string'||typeof message.id==='number'&&Number.isFinite(message.id))?message.id:null;
 const version=request.headers.get('mcp-protocol-version');
 const params=isObject(message)&&isObject(message.params)?message.params:{};
 const meta=isObject(params._meta)?params._meta:{};
 const bodyVersion=meta['io.modelcontextprotocol/protocolVersion'];
 if(version===MCP_VERSION&&(typeof bodyVersion!=='string'||!isObject(meta['io.modelcontextprotocol/clientCapabilities'])))return Response.json(rpcError(id,-32602,'Required protocol metadata is missing'),{status:400,headers:mcpHeaders});
 if(bodyVersion!==undefined&&bodyVersion!==version)return Response.json(rpcError(id,-32020,'MCP protocol header does not match metadata'),{status:400,headers:mcpHeaders});
 if(version&&!MCP_SUPPORTED_VERSIONS.includes(version))return Response.json({...rpcError(id,-32022,'Unsupported protocol version'),error:{code:-32022,message:'Unsupported protocol version',data:{supported:MCP_SUPPORTED_VERSIONS,requested:version}}},{status:400,headers:mcpHeaders});
 if(version===MCP_VERSION||bodyVersion===MCP_VERSION) {
  const method=isObject(message)?message.method:undefined;
  if(version!==bodyVersion||!version||request.headers.get('mcp-method')!==method||(['tools/call','resources/read','prompts/get'].includes(String(method))&&decodeName(request.headers.get('mcp-name'))!==(params.name??params.uri)))return Response.json(rpcError(id,-32020,'Missing or mismatched MCP metadata headers'),{status:400,headers:mcpHeaders});
 }
}
export function unsupportedMcpMethod(request:Request) {
 return originError(request)??new Response(null,{status:405,headers:{...mcpHeaders,Allow:'POST, OPTIONS'}});
}
