"""Read-only XLSX ingestion. No workbook is saved or changed; outputs are deterministic.
Usage: python scripts/import-video-workbooks.py INPUT.zip
Requires openpyxl (scripts/requirements-video.txt).
"""
import argparse, hashlib, io, json, re, shutil, warnings, zipfile
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
import openpyxl
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
DISTRICTS = '강남구 강동구 강북구 강서구 관악구 광진구 구로구 금천구 노원구 도봉구 동대문구 동작구 마포구 서대문구 서초구 성동구 성북구 송파구 양천구 영등포구 용산구 은평구 종로구 중구 중랑구'.split()
PRIMARY = {'강남구_동영상.xlsx':'전체영상_34열','성동구_동영상.xlsx':'성동구_전체영상','종로구_동영상(GPT).xlsx':'전체영상_34열','동대문구_영상.xlsx':'누적101건','동영상_광진.xlsx':'누적 조사대장','서울_도시역사_유튜브.xlsx':'누적링크_128건','송파구_영상.xlsx':'02_누적134+5','서초_영상.xlsx':'원본54열','중구_영상.xlsx':'전체자료_54열','중랑구_영상.xlsx':'원본54열','강북구.xlsx':'gangbook','노원구.xlsx':'nowon','도봉구.xlsx':'dobong (2)','서대문구_역사영상.xlsx':'전체자료54열','성북구_역사영상.xlsx':'03_전체54열','은평구_역사영상.xlsx':'전체영상_54열','강서구.xlsx':'02_전체원본54열','마포구.xlsx':'전체조사대장','용산구.xlsx':'영상전체54열','구로구.xlsx':'guro','양천구.xlsx':'yangcheon','영등포구.xlsx':'ydp','강동구_역사영상.xlsx':'누적영상_135','관악구_역사영상.xlsx':'01_전체원자료54열','금천구.xlsx':'누적영상150','동작구_역사영상.xlsx':'누적 조사대장'}

def digest(value): return hashlib.sha256(value).hexdigest()
def text(value): return '' if value is None else value.isoformat() if hasattr(value,'isoformat') else str(value)
def key(value): return re.sub(r'\s+', '', value)
def pick(values,*names):
 for name in names:
  value=values.get(key(name),'').strip()
  if value:return value
 return ''
def safe_url(value):
 value=value.strip()
 if not re.fullmatch(r'https?://[^\s<>"\[\]]+',value):return None
 p=urlsplit(value)
 if not p.hostname or p.username or p.password:return None
 if p.hostname in ('localhost','127.0.0.1') or not '.' in p.hostname:return None
 return value
def canonical(value):
 value=safe_url(value)
 if not value:return None,'missing_or_annotated_url',''
 p=urlsplit(value); host=p.hostname.lower(); path=p.path.rstrip('/')
 q=dict(parse_qsl(p.query)); vid=''
 if host in ('youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtu.be','www.youtube-nocookie.com','youtube-nocookie.com'):
  vid=path.strip('/') if 'youtu.be' in host else q.get('v','') if path=='/watch' else path.split('/')[-1] if path.startswith(('/shorts/','/embed/','/live/')) else ''
  if not re.fullmatch(r'[\w-]{11}',vid):return None,'uncertain_video_id',''
  return 'https://www.youtube.com/watch?v='+vid,'detail_candidate',vid
 if path.lower().endswith(('.pdf','.jpg','.png','.xlsx')):return None,'non_video_reference',''
 if re.search(r'(?:search|/results|/list(?:\.|/|$))',path,re.I) or not path:return None,'search_or_collection',''
 if host in ('archives.seoul.go.kr','www.archives.seoul.go.kr') and re.fullmatch(r'/item/\d+',path):return 'https://archives.seoul.go.kr/item/'+str(int(path.split('/')[-1])),'detail_candidate',''
 if host.endswith('ehistory.go.kr') and q.get('mediadtl'):
  return 'https://www.ehistory.go.kr/view/movie?'+urlencode(sorted((k,v) for k,v in q.items() if k in ('mediadtl','mediagbn'))),'detail_candidate',''
 query=sorted((k,v) for k,v in parse_qsl(p.query) if not k.lower().startswith('utm_') and k.lower() not in ('t','start','feature','si','previousurl'))
 return urlunsplit(('https',host,path,urlencode(query),'')),'detail_candidate',''
def seconds(value):
 if not re.fullmatch(r'\d{1,3}:\d{2}(?::\d{2})?',value.strip()):return None
 parts=list(map(int,value.split(':')))
 if any(n>=60 for n in parts[1:]):return None
 return parts[0]*60+parts[1] if len(parts)==2 else parts[0]*3600+parts[1]*60+parts[2]
def header_index(rows):
 for i,row in enumerate(rows[:15]):
  labels={key(v) for v in row}
  if labels&{'자료ID','번호'}:return i
 return None
def decoded_name(info):
 if info.flag_bits&0x800:return info.filename
 try:return info.filename.encode('cp437').decode('cp949')
 except (UnicodeError,LookupError):return info.filename
def dump(path,value):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')

def run(archive):
 out=ROOT/'data/video-workbooks'; assets=ROOT/'public/research/video-workbooks'
 assets.mkdir(parents=True,exist_ok=True)
 archive_hash=digest(archive.read_bytes())
 if archive.resolve()!=(assets/'original.zip').resolve():shutil.copyfile(archive,assets/'original.zip')
 files=[]; allrows={}; sheets=[]; records=[]; pending=[]; workbook_count=0;pdf_links=[]
 with zipfile.ZipFile(archive) as z:
  for info in z.infolist():
   name=decoded_name(info)
   if info.is_dir() or not name.lower().endswith(('.xlsx','.pdf')):continue
   data=z.read(info); fid='source-'+digest(name.encode())[:12]; ext=Path(name).suffix.lower(); asset=assets/(fid+ext);asset.write_bytes(data)
   source={'id':fid,'name':name,'filename':Path(name).name,'path':'/research/video-workbooks/'+asset.name,'sha256':digest(data),'bytes':len(data),'kind':ext[1:]};files.append(source)
   if ext=='.pdf':
    pdf=PdfReader(io.BytesIO(data));source['pages']=len(pdf.pages)
    for page_number,page in enumerate(pdf.pages,1):
     for raw_url in re.findall(r'https?://[^\s<>]+',page.extract_text() or ''):
      normalized=canonical(raw_url.rstrip('.,;)'))[0]
      if normalized:pdf_links.append({'fileId':fid,'page':page_number,'url':normalized,'rawUrl':raw_url})
    continue
   workbook_count+=1
   with warnings.catch_warnings():
    warnings.simplefilter('ignore',UserWarning)
    wb=openpyxl.load_workbook(io.BytesIO(data),data_only=False,read_only=False)
   tables={}
   for ws in wb:
    rows=[[text(c.value) for c in row] for row in ws.iter_rows()]
    h=header_index(rows);headers=rows[h] if h is not None else []
    role='primary' if ws.title==PRIMARY.get(Path(name).name) else 'segments' if any(key(v) in ('시작시각','관련구간시작') for v in headers) else 'supporting'
    sheet={'fileId':fid,'sheet':ws.title,'headerRow':None if h is None else h+1,'headers':headers,'role':role,'nonemptyRows':sum(any(r) for r in rows),'dataRows':0,'validUrlRows':0,'duplicateUrlRows':0,'heldUrlRows':0,'matchedPrimaryIds':0,'unmatchedSegmentRows':0}
    seen_urls=set()
    parsed=[]
    if h is not None:
     for n,row in enumerate(rows[h+1:],h+2):
      if not any(row):continue
      values={key(label):row[j] if j<len(row) else '' for j,label in enumerate(headers) if label}
      rid=pick(values,'자료ID','번호')
      if not rid:continue
      ref=f'{fid}:{ws.title}:{n}';sheet['dataRows']+=1
      links=[{'column':c.column,'target':c.hyperlink.target} for c in ws[n] if c.hyperlink and c.hyperlink.target]
      allrows[ref]={'fileId':fid,'sheet':ws.title,'row':n,'originalId':rid,'cells':row,'hyperlinks':links}
      parsed.append((ref,values))
      raw_url=pick(values,'영상URL','YouTube 직접 URL','원문URL','출처URL','원출처URL','공식원출처URL','상세URL')
      url=canonical(raw_url)[0]
      if url:
       sheet['validUrlRows']+=1
       if url in seen_urls:sheet['duplicateUrlRows']+=1
       seen_urls.add(url)
      else:sheet['heldUrlRows']+=1
    tables[ws.title]=(sheet,parsed);sheets.append(sheet)
   expected=PRIMARY.get(Path(name).name)
   if not expected or expected not in tables:raise ValueError('대표 시트 선택 필요: '+name)
   district=next((d for d in sorted(DISTRICTS,key=len,reverse=True) if d in Path(name).name),'')
   if '광진' in Path(name).name:district='광진구'
   if '서초' in Path(name).name:district='서초구'
   primary=tables[expected][1]
   lookup={}
   for ref,v in primary:
    rid=pick(v,'자료ID','번호');title=pick(v,'자료명','자료제목','제목','영상 제목/식별') or '(제목 미기재)'
    raw_url=pick(v,'영상URL','YouTube 직접 URL','원문URL','출처URL','원출처URL','공식원출처URL','상세URL')
    url,state,vid=canonical(raw_url)
    explicit=pick(v,'영상ID','영상 ID')
    if vid and re.fullmatch(r'[\w-]{11}',explicit) and explicit!=vid:url,state=None,'id_conflict'
    place=pick(v,'관련장소','관련장소명','장소명','원문장소표기','행정동·장소','장소·지역')
    legal=pick(v,'법정동');admin=pick(v,'행정동')
    legal_dongs=[d.strip() for d in re.split(r'[,·/]',legal) if re.fullmatch(r'[가-힣]+\d*동(?:\d가)?',d.strip())]
    mentioned=sorted(set(re.findall(r'(?<![가-힣])[가-힣]{2,}\d*동(?:\d가)?',place)))
    historical=pick(v,'역사적대상시기','대상시기','촬영·제작·대상시기','기록 시기')
    rec={'ref':ref,'originalId':rid,'title':title,'url':url,'rawUrl':raw_url,'urlStatus':state,'videoId':vid,'district':district,'legalDongs':legal_dongs,'administrativeDong':admin,'mentionedDongs':mentioned,'place':place,'address':pick(v,'현재주소','원문지번·주소표기','옛주소원문'),'scope':pick(v,'공간범위') or '위치 미검증','description':pick(v,'사이트용소개문초안','자료요약','요약','내용요약','내용설명','역사내용·근거','설명·검토 메모'),'channel':pick(v,'제작기관','제작·소장기관','제작·생산기관','제공기관·채널','출처기관','기관명','원본 채널/공식 기관'),'provider':pick(v,'출처명','자료원구분','영상플랫폼','출처기관','제공기관·채널','원본 채널/공식 기관'),'sourceUrl':safe_url(pick(v,'출처URL','공식원출처URL','원출처URL','원문URL','상세URL','근거 출처 URL')),'historicalPeriod':historical,'date':pick(v,'날짜','자료일자','대표날짜','촬영·제작일','기록 시기'),'dateType':pick(v,'날짜유형'),'filmedAt':pick(v,'촬영일','촬영·제작일'),'producedAt':pick(v,'제작일'),'publishedAt':pick(v,'게시·발행일'),'duration':pick(v,'전체재생시간'),'reportedVerification':pick(v,'확인수준','확인단계','존재 확인 근거'),'reportedPlayback':pick(v,'실제재생확인여부','실제 재생 여부'),'rights':pick(v,'개별이용조건','영상이용조건·사용승인상태','저작권·이용조건상태','이용조건','이용조건및근거','저작권·초상권'),'notes':pick(v,'검증메모·추가확인','추가검증메모','추가확인사항','후속확인사항','비고','설명·검토 메모'),'group':pick(v,'분류','A_B_C분류','검증등급','등급'),'segments':[],'supportingRefs':[],'independentlyVerified':False,'embeddingAllowed':False}
    if not url:pending.append(ref)
    records.append(rec);lookup[rid]=rec
   for sheet,rows in tables.values():
    if sheet['role']=='primary':continue
    for ref,v in rows:
     rec=lookup.get(pick(v,'자료ID','번호'))
     if not rec:
      if sheet['role']=='segments':sheet['unmatchedSegmentRows']+=1
      continue
     sheet['matchedPrimaryIds']+=1
     rec['supportingRefs'].append(ref)
     if sheet['role']=='segments':
      a=pick(v,'시작시각','관련구간시작');b=pick(v,'종료시각','관련구간끝');start,end=seconds(a),seconds(b)
      rec['segments'].append({'startLabel':a,'endLabel':b,'start':start,'end':end,'validTime':start is not None and end is not None and end>start,'verifiedTime':False,'place':pick(v,'관련장소'),'description':pick(v,'확인한내용','확인한 내용','관련구간설명','구간확인메모'),'basis':pick(v,'근거종류','검증메모','추가확인사항'),'ref':ref})
   source['primarySheet']=expected;source['primaryRows']=len(primary)
 # One occurrence per primary row. Mirrors and history rows are provenance, never new videos.
 uploaded=list(records)
 legacy=json.loads((ROOT/'data/consolidated-video-research.json').read_text(encoding='utf8'))
 for old in legacy['items']:
  url,state,vid=canonical(old.get('url') or '')
  ref='legacy:'+old['id']
  rec={'ref':ref,'originalId':old['id'],'title':old['title'],'url':url,'rawUrl':old.get('url'),'urlStatus':state,'videoId':vid,'district':'','legalDongs':[],'administrativeDong':'','mentionedDongs':[],'place':old['place'],'description':old.get('reason',''),'channel':old['channel'],'provider':'기존 통합보고서','historicalPeriod':'','date':old['date'],'dateType':'보고서 날짜 표기','duration':old['duration'],'segments':[{**s,'verifiedTime':False,'ref':ref} for s in old['segments']],'supportingRefs':[],'group':old['group'],'independentlyVerified':False,'embeddingAllowed':False,'legacyRegionLinks':old['regionLinks']}
  records.append(rec);allrows[ref]={'fileId':'legacy','sheet':'기존 통합보고서','row':None,'originalId':old['id'],'cells':old}
 grouped=defaultdict(list)
 for r in records:grouped[r['url'] or 'pending:'+r['ref']].append(r)
 items=[]
 for url,rr in grouped.items():
  first=rr[0]; ident='video-'+digest(url.encode())[:20]
  links=[]
  for r in rr:
   if 'legacyRegionLinks' in r:links.extend({'district':l['district'],'legalDongs':[],'administrativeDong':'','mentionedDongs':[l['dong']] if l['dong'] else [],'place':r['place'],'scope':'기존 보고서 지역 관련 후보'} for l in r['legacyRegionLinks'])
   else:links.append({'district':r['district'],'legalDongs':r['legalDongs'],'administrativeDong':r['administrativeDong'],'mentionedDongs':r['mentionedDongs'],'place':r['place'],'scope':r['scope']})
  items.append({'id':ident,**{k:first[k] for k in ('title','url','videoId','urlStatus','description','channel','provider','historicalPeriod','date','dateType','duration')},'refs':[r['ref'] for r in rr],'originalIds':sorted(set(r['originalId'] for r in rr)),'regionLinks':links,'providers':sorted(set(r['provider'] for r in rr if r['provider'])),'historicalPeriods':sorted(set(r['historicalPeriod'] for r in rr if r['historicalPeriod'])),'source':'both' if any(r['ref'].startswith('legacy:') for r in rr) and any(not r['ref'].startswith('legacy:') for r in rr) else 'legacy' if rr[0]['ref'].startswith('legacy:') else 'workbooks','reviewStatus':'pending' if first['url'] else 'held','independentlyVerified':False,'embeddingAllowed':False})
 titles=defaultdict(list)
 for item in items:titles[re.sub(r'\W+','',item['title']).casefold()].append(item)
 for matches in titles.values():
  for item in matches:item['possibleDuplicateCount']=len(matches)-1
 counts=Counter(r['district'] for r in uploaded)
 imported_urls={r['url'] for r in uploaded if r['url']}
 meta={'version':1,'archiveSha256':archive_hash,'workbookCount':workbook_count,'pdfCount':sum(f['kind']=='pdf' for f in files),'districtCount':len([d for d in counts if d]),'primaryRows':len(uploaded),'importedLinkedVideos':len(imported_urls),'uniqueLinkedVideos':sum(bool(i['url']) for i in items),'heldRows':len(pending),'duplicatePrimaryRows':len(uploaded)-len(imported_urls)-len(pending),'legacyOverlap':sum(i['source']=='both' for i in items),'legacyVideoCount':len(legacy['items']),'legacyExcludedCount':len(legacy['excluded']),'uniqueEntries':len(items),'segmentRows':sum(len(r['segments']) for r in uploaded),'districtRows':dict(counts),'independentlyVerifiedVideos':0}
 meta['note']='같은 상세 URL·영상 ID만 통합했습니다. 실제 재생·위치·권리는 독립 검증 전입니다.'
 meta['possibleDuplicateTitleGroups']=sum(len(v)>1 for v in titles.values())
 dump(out/'index.json',{'meta':meta,'files':files,'sheets':sheets,'items':items});dump(out/'records.json',{'records':{r['ref']:r for r in records},'rows':allrows})
 url_ids={i['url']:i['id'] for i in items if i['url']}
 dump(out/'pdf-references.json',{'references':[{**link,'videoId':url_ids.get(link['url'])} for link in pdf_links],'note':'PDF 페이지에 같은 URL이 나타난 관계만 표시합니다. 문서의 주장·재생 확인 표기는 사이트 검증 결과가 아니며 엑셀 행과 자동 병합하지 않았습니다.'})
 dump(assets/'import-audit.json',{'meta':meta,'files':files,'sheets':sheets})
 print(json.dumps(meta,ensure_ascii=False,indent=2))
 if workbook_count!=26 or meta['districtCount']!=25:raise ValueError('입력 파일 수/자치구 범위를 확인하세요')

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('archive',type=Path);args=parser.parse_args();run(args.archive)
