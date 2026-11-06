/** One polite retry for transient OpenAI rate limits (not for exhausted quota). */
export async function openaiFetch(url:string,init:RequestInit){
 let r=await fetch(url,init);
 if(r.status===429){const t=await r.clone().json().catch(()=>({})) as {error?:{code?:string}};if(t.error?.code!=='insufficient_quota'){await new Promise(s=>setTimeout(s,1800));r=await fetch(url,init);}}
 return r;
}
