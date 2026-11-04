"""Preserve bounded original files from item-published URLs; never resize or transcode."""
from pathlib import Path
import json,urllib.request,urllib.error,concurrent.futures,sys,hashlib
CACHE=Path(sys.argv[1]);records=json.loads((CACHE/'museum-records.json').read_text());OUT=CACHE/'originals';OUT.mkdir(exist_ok=True)
limit=10*1024*1024;selected=[];by_gu={}
for r in records:
 if r.get('rights')=='KOGL1' and r.get('originalUrl'):
  by_gu.setdefault(r['gu'],[]).append(r)
for index in range(3):
 for group in by_gu.values():
  if len(group)>index:selected.append(group[index])
def download(r):
 url=r['originalUrl'];name=hashlib.sha256(r['url'].encode()).hexdigest()[:24];base={'sourceUrl':r['url'],'title':r['fields']['명칭'],'sourceLicense':'KOGL1','attribution':'서울역사박물관 · '+r['fields']['명칭']+' · 공공누리 제1유형','originalUrl':url}
 try:
  with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'SeoulPlaceHistoryResearch/1.0'}),timeout=20) as res:
   if int(res.headers.get('Content-Length') or 0)>limit:return {**base,'status':'over_10MB'}
   b=res.read(limit+1)
   if len(b)>limit:return {**base,'status':'over_10MB'}
   ext='tif' if b[:4] in [b'II*\0',b'MM\0*'] else 'jpg' if b[:2]==b'\xff\xd8' else 'png' if b[:8]==b'\x89PNG\r\n\x1a\n' else 'pdf' if b.startswith(b'%PDF-') else None
   if not ext:return {**base,'status':'unsupported_format'}
   path=OUT/(name+'.'+ext);path.write_bytes(b);return {**base,'status':'saved','path':str(path),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
 except Exception as e:return {**base,'status':type(e).__name__}
results=[]
# Sequential original retrieval avoids large concurrent transfers; stop at 20 preserved originals.
for i,r in enumerate(selected):
 item=download(r);results.append(item);print('original',i+1,item['status'],item.get('bytes',0),flush=True)
 if sum(x['status']=='saved' for x in results)>=20:break
(CACHE/'original-files.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print('preserved',sum(x['status']=='saved' for x in results),flush=True)
