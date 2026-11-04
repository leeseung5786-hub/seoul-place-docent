"""Bounded official museum catalog collector. Run locally; no credentials required.
Stores metadata/descriptions only when the item explicitly grants KOGL1; other items remain metadata.
Files are downloaded separately from URLs published in item pages, subject to the same license gate.
"""
from pathlib import Path
from lxml import html
import urllib.request,urllib.parse,urllib.error,json,re,hashlib,concurrent.futures,sys,time
ROOT=Path(__file__).resolve().parents[1]
CACHE=Path(sys.argv[1]) if len(sys.argv)>1 else Path('/workspace/scratch/64f6279900e6')
for folder in ['collection-cache','detail-cache']: (CACHE/folder).mkdir(parents=True,exist_ok=True)
collections=json.loads((ROOT/'data/museum-collections.json').read_text())
BASE='https://museum.seoul.go.kr'
def fetch(url,path):
 if path.exists():return path.read_text()
 req=urllib.request.Request(url,headers={'User-Agent':'SeoulPlaceHistoryResearch/1.0 (bounded public catalog collection)'})
 for attempt in range(3):
  try:
   with urllib.request.urlopen(req,timeout=22) as r: text=r.read().decode('utf-8')
   break
  except (urllib.error.URLError,TimeoutError):
   if attempt==2:raise
   time.sleep(0.7*(attempt+1))
 path.write_text(text);return text

def collection(c):
 try:
  text=fetch(c['url'],CACHE/'collection-cache'/f"{c['categoryId']}.html");doc=html.fromstring(text)
  links=[]
  for li in doc.xpath('//li[contains(concat(" ",normalize-space(@class)," ")," thumb-item ")]'):
   node=li.xpath('.//a[contains(@onclick,"jsViewAction")]');titles=li.xpath('.//*[contains(@class,"thumb_title")]')
   if not node or not titles:continue
   args=re.search(r"jsViewAction\('([^']+)',\s*'([^']+)',\s*'([^']+)'",node[0].get('onclick',''))
   if not args:continue
   upper,sn,fid=args.groups();title=' '.join(titles[0].text_content().split())
   links.append({**c,'recordTitle':title,'upperNodeId':upper,'fileSn':sn,'fileId':fid})
  def priority(r):
   years=[int(x) for x in re.findall(r'(?<!\d)(?:18|19|20)\d{2}(?!\d)',r['recordTitle'])]
   return 0 if any(y<2000 for y in years) else 1
  links.sort(key=priority)
  return {'collection':c,'items':links[:3],'status':'ok'}
 except Exception as e:return {'collection':c,'items':[],'status':type(e).__name__}
print('Collecting 43 official collection pages',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 groups=[]
 for r in pool.map(collection,collections):
  groups.append(r);print('collection',r['collection']['name'],r['status'],len(r['items']),flush=True)
(CACHE/'collection-results.json').write_text(json.dumps(groups,ensure_ascii=False,indent=2))
items=[i for g in groups for i in g['items']]
def detail(c):
 params={k:c[k] for k in ['categoryId','upperNodeId','fileSn','fileId']};params['ctgryId']=params.pop('categoryId');params['type']='A';url=BASE+'/archive/archiveNew/NR_archiveView.do?'+urllib.parse.urlencode(params)
 try:
  text=fetch(url,CACHE/'detail-cache'/f"{hashlib.sha256(url.encode()).hexdigest()[:24]}.html");doc=html.fromstring(text);fields={}
  for tr in doc.xpath('//div[contains(@class,"view_con")]//tr'):
   th=tr.xpath('./th');td=tr.xpath('./td')
   if th and td:fields[' '.join(th[0].text_content().split())]=' '.join(td[0].text_content().split())
  banner=doc.xpath('//a[contains(@href,"kogl.or.kr/info/licenseType")]/@href')
  rights='KOGL1' if any('licenseType1.do' in u for u in banner) else next(('KOGL'+str(i) for i in range(2,5) if any(f'licenseType{i}.do' in u for u in banner)),'unknown')
  original=doc.xpath('//input[@id="fullViewPath"]/@value')
  caption=fields.get('내용','')
  if not fields.get('명칭') or not fields.get('아카이브 번호'):return {**c,'status':'missing_fields','url':url}
  return {**c,'url':url,'status':'ok','fields':{k:v for k,v in fields.items() if k!='내용'},'description':caption if rights=='KOGL1' else '', 'rights':rights,'rightsEvidence':next(iter(banner),''),'originalUrl':next(iter(original),''),'checkedAt':'2026-10-16','pageHash':hashlib.sha256(text.encode()).hexdigest()}
 except Exception as e:return {**c,'url':url,'status':type(e).__name__,'error':str(e)[:200]}
print('Collecting',len(items),'item pages',flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
 records=[]
 for i,r in enumerate(pool.map(detail,items),1):
  records.append(r)
  if i%10==0:print('items',i,'/',len(items),flush=True)
(CACHE/'museum-records.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
print(json.dumps({'total':len(records),'ok':sum(r['status']=='ok' for r in records),'KOGL1':sum(r.get('rights')=='KOGL1' for r in records)},ensure_ascii=False),flush=True)
