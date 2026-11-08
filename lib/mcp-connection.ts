/** Public configuration only. Never accept embedded credentials, query tokens or a Sites MCP URL. */
export function publicMcpUrl(value:string|undefined):string|null{
 try{
  const url=new URL(value||'');
  if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.pathname!=='/mcp'||url.hostname==='chatgpt.site'||url.hostname.endsWith('.chatgpt.site'))return null;
  return url.href;
 }catch{return null;}
}
