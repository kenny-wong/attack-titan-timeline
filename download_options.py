import json,urllib.request,concurrent.futures,io
from pathlib import Path
from PIL import Image
p=Path(__file__).resolve().parent;o=p/'assets/icon-options';o.mkdir(exist_ok=True)
c=json.loads((p/'assets/icon-candidates.json').read_text())
def job(pair):
 k,vs=pair; good=[]
 for j,v in enumerate(vs):
  if len(good)>=3:break
  try:
   data=urllib.request.urlopen(urllib.request.Request(v['url'],headers={'User-Agent':'Mozilla/5.0'}),timeout=8).read(); im=Image.open(io.BytesIO(data)).convert('RGB');im.thumbnail((420,420));name=k+'-'+str(j)+'.webp';im.save(o/name,quality=86);good.append(dict(file='assets/icon-options/'+name,source=v['url'],description=v['description']))
  except Exception:pass
 return k,good
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex: result=dict(ex.map(job,c.items()))
(o/'downloaded.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print({k:len(v) for k,v in result.items()})
