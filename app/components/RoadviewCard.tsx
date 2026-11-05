'use client';
import {useRef,useState} from 'react';
import {Loader2,Navigation} from 'lucide-react';
import {loadSdk,type Maps} from './KakaoMapPanel';
type Pos={getLat:()=>number;getLng:()=>number};
type RoadviewMaps=Maps&{Roadview:new(node:HTMLElement)=>{setPanoId:(panoId:number,position:Pos)=>void};RoadviewClient:new()=>{getNearestPanoId:(position:Pos,radius:number,callback:(panoId:number|null)=>void)=>void}};
export type RoadviewState='idle'|'loading'|'ready'|'none'|'error';
/** Embeds Kakao's own interactive roadview (the images are shown through Kakao's viewer, never copied or stored). Loads only after a click to limit API usage. */
export default function RoadviewCard({point,en=false,onState}:{point:{x:number;y:number};en?:boolean;onState?:(state:RoadviewState)=>void}){
 const box=useRef<HTMLDivElement>(null);const [state,setState]=useState<RoadviewState>('idle');const [message,setMessage]=useState('');const requested=useRef(0);
 const update=(next:RoadviewState)=>{setState(next);onState?.(next);};
 async function open(){
  const ticket=++requested.current;update('loading');setMessage('');
  try{
   const maps=await loadSdk() as RoadviewMaps;if(ticket!==requested.current)return;
   if(typeof maps.RoadviewClient!=='function'||typeof maps.Roadview!=='function')throw new Error(en?'Roadview is not available.':'로드뷰를 사용할 수 없습니다.');
   const position=new maps.LatLng(point.y,point.x);
   const client=new maps.RoadviewClient();
   client.getNearestPanoId(position,60,panoId=>{
    if(ticket!==requested.current)return;
    if(panoId===null||panoId===undefined){update('none');setMessage(en?'No street-level imagery within 60 m of this point.':'이 위치 반경 60m 안에는 로드뷰 사진이 없어요.');return;}
    update('ready');
    requestAnimationFrame(()=>{if(ticket!==requested.current||!box.current)return;try{new maps.Roadview(box.current).setPanoId(panoId,position);}catch{update('error');setMessage(en?'Unable to display roadview.':'로드뷰를 표시하지 못했어요.');}});
   });
  }catch(e){if(ticket!==requested.current)return;update('error');setMessage(e instanceof Error?e.message:(en?'Unable to load roadview.':'로드뷰를 불러오지 못했어요.'));}
 }
 return <div className="roadview-card" data-state={state}>
  {state==='ready'?<div ref={box} className="roadview-box" role="img" aria-label={en?'Interactive street view of today':'오늘의 거리 로드뷰'}/>:<div className="roadview-idle">
   {state==='loading'?<><Loader2 className="spin" size={22}/><span>{en?'Loading street view…':'로드뷰를 불러오고 있어요'}</span></>:<>
    <Navigation size={26} strokeWidth={1.4}/>
    <button type="button" className="roadview-open" onClick={open}>{state==='idle'?(en?'See this place today':'오늘의 거리 보기'):(en?'Try again':'다시 시도')}</button>
    {message&&<p role="status">{message}</p>}
   </>}
  </div>}
  <small className="roadview-credit">{en?'Street view © Kakao · shown through Kakao’s viewer':'로드뷰 © Kakao · 카카오 로드뷰 화면으로 표시'}</small>
 </div>;
}
