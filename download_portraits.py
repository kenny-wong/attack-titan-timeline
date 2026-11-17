import urllib.request,concurrent.futures,json,base64,io
from pathlib import Path
from PIL import Image
p=Path(__file__).resolve().parent; out=p/'assets/portraits';out.mkdir(exist_ok=True)
names=dict(grisha='grisha-yeager',keith='keith-shadis',kruger='eren-kruger',reiner='reiner-braun',bert='bertholt-hoover',annie='annie-leonhart',marcel='marcel-galliard',ymir='ymir',eren='eren-yeager',armin='armin-arlert',mikasa='mikasa-ackerman',fried='frieda-reiss',zeke='zeke-yeager',pieck='pieck-finger',historia='krista-lenz',rod='rod-reiss',levi='levi-ackerman',erwin='erwin-smith',yelena='yelena',ony='onyankopon',porco='porco-galliard',gabi='gabi-braun',falco='falco-grice',arminE='armin-colossal-titan')
urls={k:'https://aotdle.net/images/tapone/'+v+'.webp' for k,v in names.items()}
urls.update(karl='https://api.duniagames.co.id/api/content/upload/file/13273220031761816481.png',scouts='https://staticg.sportskeeda.com/editor/2022/05/e7a33-16521569797841-1920.jpg',garrison='https://cdn.shopify.com/s/files/1/0400/9767/7479/files/Attack_On_Titan_Soldiers_Standing_Over_Town.jpg?v=1714133830',civ='https://m.media-amazon.com/images/S/pv-target-images/d5cc320905e9d0e10ec5f49161eaae081179d9f225d0268cf22667bc4915f4b6.png',walltitans='https://image.idntimes.com/post/20231207/untitled-0616a31cdeeb031ca0c3658a993c19d7.png?tr=w-1200',pure='https://cdn.ftvnews.com.tw/summernotefiles/News/5e648ece-5887-4d45-812e-07fb720b5fb4.jpg',alliance='https://static.animecorner.me/2022/03/attack-on-titan-episode-84-1.png')
def get(pair):
 k,u=pair
 try:
  data=urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=25).read(); im=Image.open(io.BytesIO(data)).convert('RGB');im.thumbnail((320,240));im.save(out/(k+'.webp'),'WEBP',quality=85);return k,'ok'
 except Exception as e:return k,str(e)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex: print(list(ex.map(get,urls.items())))
(out/'sources.json').write_text(json.dumps(urls,indent=2))
