"""Collect only observed official menu links into a local research cache; no credentials.
Run after caching the guro and eunpyeong seed pages. Raw HTML stays outside the source repository.
"""
from pathlib import Path
from lxml import html
import urllib.request,urllib.parse,json,concurrent.futures,hashlib,time,sys
base=Path(sys.argv[1]);items=[]
# URLs come from retrieved official menus, not guessed route IDs.
d=html.fromstring((base/'guro.html').read_bytes())
for a in d.xpath('//a'):
 href=a.get('href','');name=a.text_content().strip()
 if any(('key='+str(k)+'&') in href for k in range(2127,2137)) and name.endswith('동'):items.append({'gu':'구로구','name':name,'url':urllib.parse.urljoin('https://www.guro.go.kr',href),'key':'guro-'+name})
d=html.fromstring((base/'eunpyeong.html').read_bytes())
for a in d.xpath('//a'):
 if a.text_content().strip()=='지명유래' and a.get('href','').startswith('/dong/contents.do?key='):items.append({'gu':'은평구','url':urllib.parse.urljoin('https://www.ep.go.kr',a.get('href')),'key':'ep-'+a.get('href').split('key=')[-1]})
seen=set();items=[x for x in items if not(x['url'] in seen or seen.add(x['url']))]
def f(r):
 p=base/(r['key']+'.html')
 try:
  if not p.exists():
   with urllib.request.urlopen(r['url'],timeout=22) as res:b=res.read()
   p.write_bytes(b);time.sleep(.2)
  b=p.read_bytes();d=html.fromstring(b);c=d.xpath('//*[@id="contents"]')[0];[x.drop_tree() for x in c.xpath('.//script|.//style')]
  if r['gu']=='은평구':r['name']=''.join(c.xpath('.//h3')[0].itertext()).strip()
  r.update(status='ok',pageHash=hashlib.sha256(b).hexdigest(),path=str(p),body=' '.join(c.text_content().split()),capturedAt=p.stat().st_mtime)
  print(r['gu'],r['name'],'ok',flush=True)
 except Exception as e:r.update(status=type(e).__name__);print(r['key'],r['status'],flush=True)
 return r
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:result=list(pool.map(f,items))
(base/'dong-pages.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print('TOTAL',len(result),sum(x['status']=='ok' for x in result),flush=True)
