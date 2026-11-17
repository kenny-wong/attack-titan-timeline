import json,io,base64
from pathlib import Path
from PIL import Image
p=Path(__file__).parent
rows=json.loads((p/'assets/icon-options/choices.json').read_text(encoding='utf8'))
checked=0
for r in rows:
 assert len(r['options'])>=3
 for o in r['options']:
  s=o['src']
  if s.startswith('data:image/svg'): continue
  b=base64.b64decode(s.split(',',1)[1]) if s.startswith('data:') else (p/s).read_bytes()
  Image.open(io.BytesIO(b)).verify();checked+=1
print(len(rows),'entries;',checked,'raster images validated; each has at least 3 options')
