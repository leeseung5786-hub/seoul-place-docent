"""Build an auditable catalog import from collected, item-level evidence. No network/secrets."""
from pathlib import Path
import json,re,sys,hashlib
from datetime import datetime,timezone
ROOT=Path(__file__).resolve().parents[1];CACHE=Path(sys.argv[1]);records=json.loads((CACHE/'museum-records.json').read_text());master=json.loads((ROOT/'data/seoul-regions.json').read_text());districts={d['name']:d for d in master['districts']};output=[]
for r in records:
 if r.get('status')!='ok':continue
 fields=r['fields'];title=fields['명칭'];license=r.get('rights','unknown');can_store=license=='KOGL1';description=r.get('description','') if can_store else ''
 place=fields.get('장소','');named=[gu for gu in districts if gu in place];gus=named or [r['gu']];region_ids=['gu-'+gu for gu in gus]
 if not named or r['gu'] in named:region_ids.append('area-'+r['categoryId'])
 for gu in gus:
  for dong in districts[gu]['dongs']:
   if re.search(r'(?<![가-힣0-9])'+re.escape(dong)+r'(?![가-힣0-9])',place):region_ids.append('dong-'+gu+'-'+dong)
 period=fields.get('시기','');book=fields.get('자료출처','')
 attribution=f"서울역사박물관 · {title} · {book} · {r['url']} · "+('공공누리 제1유형(출처표시)' if can_store else '공공누리 제2유형(출처표시·비상업적 이용)' if license=='KOGL2' else '개별 이용조건 확인 필요')
 rights_evidence=f"2026-10-16 개별 상세 페이지의 공공누리 {license.replace('KOGL','제')}유형 표시 확인. {r.get('rightsEvidence','')}" if license!='unknown' else ''
 if license=='KOGL2':rights_evidence+=' · 비상업적 이용 조건. 서비스 이용 범위 검토 전으로 원문 보관·변형 재사용 미설정.'
 metadata={**fields,'수록 컬렉션':r['name'],'공개 원본 URL':r.get('originalUrl',''),'컬렉션 URL':r['url'].split('/NR_archiveView')[0]+'/NR_archiveList.do?ctgryId='+r['categoryId']+'&type=A'}
 kind='map' if any(k in title for k in ['지도','지적도','평면도','배치도','분포도','약도','한양도','경성도']) else 'photo'
 item={'source':{'title':title,'institution':'서울역사박물관','providerId':fields['아카이브 번호'],'url':r['url'],'kind':kind,'summary':f"{r['name']} 조사 수록 자료. 자료 시기: {period or '미상'}. 제공기관 장소 표기: {place or '미상'}. 수록정보: {book or '미상'}.",'publicationDate':'','subjectPeriod':period,'rights':license,'rightsUrl':r['url'] if license!='unknown' else '', 'rightsNote':rights_evidence or '개별 원문의 이용조건 추가 확인 필요','storageAllowed':can_store,'reuseAllowed':can_store,'reviewStatus':'source_captured' if description else 'metadata_checked','regionIds':list(dict.fromkeys(region_ids))[:30]},'metadata':metadata,'description':description,'sourceLocator':'상세 자료 > 내용 항목 · '+(book or '원문 상세 페이지'),'attribution':attribution,'rightsEvidence':rights_evidence,'capturedAt':datetime.fromtimestamp((CACHE/'detail-cache'/(hashlib.sha256(r['url'].encode()).hexdigest()[:24]+'.html')).stat().st_mtime,timezone.utc).isoformat(),'pageHash':r.get('pageHash','')}
 output.append(item)
(CACHE/'museum-import.json').write_text(json.dumps(output,ensure_ascii=False,indent=2))
print(json.dumps({'items':len(output),'originalDescriptions':sum(bool(x['description']) for x in output),'rightsConfirmed':sum(x['source']['storageAllowed'] for x in output),'districtsTagged':len({rid for x in output for rid in x['source']['regionIds'] if rid.startswith('gu-')})},ensure_ascii=False))
