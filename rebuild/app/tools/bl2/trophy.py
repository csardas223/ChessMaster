from PIL import Image, ImageDraw, ImageFont
S=2048; k=S/96
im=Image.new('RGBA',(S,S),(0,0,0,0)); d=ImageDraw.Draw(im)
Y=(235,229,56); O=(120,96,14); B=(22,12,4)
def P(pts): return [(x*k,y*k) for x,y in pts]
cup=P([(29,21),(67,21),(66,34),(58,52),(53,57),(53,68),(43,68),(43,57),(38,52),(30,34)])
d.polygon(cup,fill=Y,outline=O,width=int(1.6*k))
d.rounded_rectangle(P([(33,67),(63,79)]),radius=int(1.5*k),fill=B)
cx,cy,r=48,35,9.5
d.ellipse(P([(cx-r,cy-r),(cx+r,cy+r)]),outline=O,width=int(1.8*k))
try: f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',int(13*k))
except Exception: f=ImageFont.load_default()
d.text((cx*k,cy*k+0.5*k),'1',fill=O,font=f,anchor='mm')
im=im.resize((512,512),Image.LANCZOS)
bb=im.getbbox(); c=im.crop(bb); sc=512*0.9/max(c.size); c=c.resize((round(c.width*sc),round(c.height*sc)),Image.LANCZOS)
o=Image.new('RGBA',(512,512),(0,0,0,0)); o.paste(c,((512-c.width)//2,(512-c.height)//2),c); o.save('out/trophy.png')
