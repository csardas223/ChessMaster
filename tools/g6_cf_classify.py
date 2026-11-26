import sys, glob
from PIL import Image, ImageDraw
def classify(px):
    r,g,b=px
    if g>170 and r<150 and b<130: return 'G'      # green
    if r>170 and g>170 and b<120: return 'Y'      # yellow lock/key
    if b>150 and r<120 and g>100: return 'B'      # blue piece
    if r>170 and g<110 and b<110: return 'R'      # red
    if r>120 and b>140 and g<110: return 'P'      # purple
    if r<50 and g<50 and b<50: return 'K'         # black
    return '.'
def run(f, x0=174, y0=180, cw=98.25, ch=98.18, cols=16, rows=11):
    im=Image.open(f).convert('RGB'); out=[]
    for r in range(rows):
        line=''
        for c in range(cols):
            cnt={}
            for dy in range(10,int(ch)-10,4):
                for dx in range(10,int(cw)-10,4):
                    k=classify(im.getpixel((int(x0+c*cw+dx),int(y0+r*ch+dy))))
                    cnt[k]=cnt.get(k,0)+1
            tot=sum(cnt.values())
            best='.'
            fr=lambda k: cnt.get(k,0)/tot
            if fr('R')>0.08: best='R'
            elif fr('B')>0.08: best='B'
            elif fr('Y')>0.3: best='Y'
            elif fr('P')>0.3: best='P'
            elif fr('G')>0.25: best='G'
            elif fr('K')>0.12 and fr('G')<0.05: best='?'
            elif fr('G')>0.08: best='g'
            elif fr('Y')>0.03: best='y'
            line+=best
        out.append(line)
    d=ImageDraw.Draw(im)
    for c in range(cols+1): d.line([(x0+c*cw,y0),(x0+c*cw,y0+rows*ch)],fill=(255,0,255),width=2)
    for r in range(rows+1): d.line([(x0,y0+r*ch),(x0+cols*cw,y0+r*ch)],fill=(255,0,255),width=2)
    for r in range(rows):
        for c in range(cols): d.text((x0+c*cw+3,y0+r*ch+2),'%d,%d'%(c,r),fill=(255,0,255))
    im.save('/workspace/work/cf_frames/grid/'+f.split('/')[-1].rsplit('.',1)[0]+'.jpg',quality=80)
    return out
if __name__=='__main__':
    for f in sys.argv[1:]:
        print(f); print('\n'.join(run(f)))
