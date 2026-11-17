from PIL import Image,ImageOps,ImageDraw
from pathlib import Path
import json
p=Path(__file__).parent
items=[x for x in json.loads((p/'assets/icon-options/extra-sources.json').read_text()) if 'src' in x]
canvas=Image.new('RGB',(1000,600),'#13252b');d=ImageDraw.Draw(canvas)
for i,o in enumerate(items):
 im=Image.open(p/o['src']).convert('RGB');im.thumbnail((500,400));im.save(p/o['src'],'WEBP',quality=86)
 x=(i%4)*250;y=(i//4)*300
 thumb=ImageOps.contain(im,(240,235));canvas.paste(thumb,(x,y));d.text((x+10,y+245),o['key']+' '+o['id'],fill='white')
canvas.save(p/'assets/icon-options/new-titans-preview.jpg')
print('Validated',len(items),'new images')
