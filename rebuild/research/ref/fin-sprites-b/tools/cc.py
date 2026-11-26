import json,sys,subprocess,io
from PIL import Image
import numpy as np
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
def get(u):
    return subprocess.run(['curl','-s','-A',UA,'-e','https://www.chess.com/',u],capture_output=True).stdout
def avatar(user):
    j=json.loads(get('https://api.chess.com/pub/player/'+user) or b'{}')
    a=j.get('avatar')
    if not a: return None,None,j.get('message')
    b=get(a)
    try: return Image.open(io.BytesIO(b)).convert('RGB'),a,None
    except Exception as e: return None,a,str(e)
def sim(a,b):
    a=np.asarray(a.convert('RGB').resize((24,24),Image.LANCZOS),float);b=np.asarray(b.convert('RGB').resize((24,24),Image.LANCZOS),float)
    return float(np.abs(a-b).mean())
if __name__=='__main__':
    ref=Image.open(sys.argv[1])
    for u in sys.argv[2:]:
        im,a,err=avatar(u)
        if im is None: print(u,'none',err); continue
        im.save('cand_'+u+'.png'); print(u,round(sim(ref,im),1),im.size,a)
