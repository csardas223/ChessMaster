# Draws the Thermopylae red Ferz ("Spiky") as a clean vector sprite, traced by eye from the 1:55 1080p frame
# (research/frames/video_thumbs/boaA9_TjXeU_frame_115.jpg, square n1 under the "72" counter): a spike tip over a
# tiered cone, wide foot, same dark outline / fill / highlight style as the other chess.com variant sprites here.
import sys
from playwright.sync_api import sync_playwright
fill=sys.argv[1] if len(sys.argv)>1 else '#bf3b43'
out=sys.argv[2] if len(sys.argv)>2 else 'ferz_r.png'
O='#262421'
svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100">
<g stroke="{O}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" fill="{fill}">
 <path d="M50 10 L52.6 21 H47.4 Z"/>
 <path d="M44.5 27.5 C44.5 22.5 47 20.5 50 20.5 C53 20.5 55.5 22.5 55.5 27.5 Z"/>
 <path d="M44.3 27.5 H55.7 C58.5 30 59.8 33 60 37 H40 C40.2 33 41.5 30 44.3 27.5 Z"/>
 <path d="M39.8 37 H60.2 C63.2 39.6 64.6 43 64.8 47 H35.2 C35.4 43 36.8 39.6 39.8 37 Z"/>
 <path d="M35 47 H65 C68 49.8 69.4 53 69.6 57 H30.4 C30.6 53 32 49.8 35 47 Z"/>
 <path d="M30.3 57 H69.7 C72.5 60 73.6 63.5 73.6 67.5 H26.4 C26.4 63.5 27.5 60 30.3 57 Z"/>
 <path d="M26.6 67.5 H73.4 C73.6 73 76 76.5 80 78.5 C81.5 80 81.5 84 80 86.5 H20 C18.5 84 18.5 80 20 78.5 C24 76.5 26.4 73 26.6 67.5 Z"/>
</g>
<g fill="#fff" opacity=".3">
 <path d="M46.4 23.6 C47 22.6 48 22.2 49 22.2 C48 23.4 47.6 24.8 47.6 26 H46 Z"/>
 <path d="M42.6 30.5 C43 29.8 43.5 29.3 44.2 29 L43.2 35.6 H41.4 Z"/>
 <path d="M38 40.5 C38.5 39.8 39 39.2 39.7 38.8 L38.6 45.6 H36.8 Z"/>
 <path d="M33.3 50.5 C33.8 49.8 34.3 49.2 35 48.8 L33.9 55.6 H32 Z"/>
 <path d="M28.6 61 C29 60.2 29.5 59.6 30.2 59.2 L29.3 66 H27.6 Z"/>
 <path d="M22 81.8 H78 V83.4 H22 Z"/>
</g>
</svg>'''
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':512,'height':512})
    pg.set_content('<html><body style="margin:0;background:transparent">'+svg+'</body></html>')
    pg.locator('svg').screenshot(path=out, omit_background=True); b.close()
