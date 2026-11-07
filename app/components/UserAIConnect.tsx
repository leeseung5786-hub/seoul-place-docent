'use client';
import {useEffect,useState} from 'react';
import {aiServices,historyQuestion} from '@/lib/user-ai';

export default function UserAIConnect({address=''}:{address?:string}) {
 const [service,setService]=useState<keyof typeof aiServices>('ChatGPT');
 const [url,setUrl]=useState('');const [message,setMessage]=useState('');
 useEffect(()=>setUrl(window.location.origin+'/mcp'),[]);
 const info=aiServices[service],question=historyQuestion(address);
 async function copy(value:string) {
  try {await navigator.clipboard.writeText(value);setMessage('복사했습니다. 선택한 AI에 붙여넣어 주세요.');}
  catch {setMessage('복사 권한을 사용할 수 없습니다. 아래 텍스트를 선택해 직접 복사해 주세요.');}
 }
 return <section className="user-ai-connect" aria-labelledby="ai-guide-title">
  <h1 id="ai-guide-title">내 AI로 역사 해설 듣기</h1>
  <div className="user-ai-body">
   <p>자료는 이 서버가 찾고, 해설은 내가 선택한 AI가 작성합니다. AI 구독을 홈페이지 API 결제로 전환하는 기능은 아닙니다.</p>
   <label>사용할 AI <select value={service} onChange={e=>{setService(e.target.value as keyof typeof aiServices);setMessage('');}}>{Object.keys(aiServices).map(name=><option key={name}>{name}</option>)}</select></label>
   <h3>{service} · {info.support}</h3><p>{info.conditions}</p>
   <ol>{info.steps.map(step=><li key={step}>{step}</li>)}</ol>
   <label>공개 MCP 서버 URL<input readOnly value={url} onFocus={e=>e.target.select()}/></label>
   {url&&!url.startsWith('https:')&&<p role="status">현재는 로컬 HTTP 주소입니다. 외부 AI에는 배포된 HTTPS 주소가 필요합니다.</p>}
   <div className="user-ai-actions"><button type="button" disabled={!url} onClick={()=>void copy(url)}>MCP 서버 URL 복사</button><a href={info.url} target="_blank" rel="noopener noreferrer">{service} 열기 ↗</a></div>
   <label>역사 질문<textarea readOnly rows={7} value={question} onFocus={e=>e.target.select()}/></label>
   {!address&&<p>홈페이지에서 주소를 선택하면 질문에 반영됩니다.</p>}
   <button type="button" onClick={()=>void copy(question)}>역사 질문 복사</button>
   <p role="status" aria-live="polite">{message}</p>
   <h4>연결 상태 확인 방법</h4><p>AI의 도구 호출 상세에서 search_place → prepare_place_answer 실행과 자료·요청 ID를 확인하세요. 이 화면에서 AI 계정 연결 여부를 확인할 수는 없습니다. 관리자 로그와 요청 ID를 대조하면 서버 호출을 확인할 수 있지만, 최종 답변에 자료가 사용됐는지는 별도로 검토해야 합니다.</p>
   <p>이 서버는 공개 자료 조회용으로 별도 로그인을 요구하지 않습니다. 배포 호스트에 로그인 제한이 있다면 운영자의 별도 설정이 필요합니다. 관리자 키는 AI에 입력하지 마세요.</p>
   <small>공식 문서 확인: 2026-11-07 · 실제 계정 연결과 답변 완료: 미검증 · <a href={info.docs} target="_blank" rel="noopener noreferrer">공식 연결 안내</a></small>
  </div>
 </section>;
}
