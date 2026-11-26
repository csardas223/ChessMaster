"""Group-6 (impl-6, seventh session): video art for the 19 group-6 modes that had no research sprite.
Owner rule 2026-11-24: art is copied from the videos (i.ytimg.com/vi/<id>/maxresdefault.jpg = the video's own title card,
maxres1-3.jpg = real frames of the video). Never drawn.
- every mode: the video's title card shown 1.6 s at game start (as the video opens on it): assets/modes/<id>/intro.jpg
- Giveaway (xAFkE7-Jp88): the video's "WINS" overlay as the win card
- Setup Chess (f4O--Ai7B9A, nFY-Hn6xiOI): the chess.com "You Won!" popup from the video as the win card
- Roblox (jXOg1Py4EoA): the 3D board's colours and the "Victory!" frame as the win card
- Fog of War master (nXpanP8v3pg): fog squares use the video's grey cloud tile
- FICS (hN-WkBw_PRs), Infinite Chess vs Pjs (iUUoeJL1FvY): board colours sampled from the frames
Run: python3 tools/g6_frames19.py   (downloads into /tmp/g6t; idempotent)"""
import os, re, urllib.request
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.join(HERE, '..'); A = 'assets/modes/'
CACHE = '/tmp/g6t'; os.makedirs(CACHE, exist_ok=True)
IDS = ['f4O--Ai7B9A', 'hN-WkBw_PRs', 'hVOA_oScEBQ', 'iUUoeJL1FvY', 'jXOg1Py4EoA', 'nFY-Hn6xiOI', 'nXpanP8v3pg', 'piiE6JB8pWw',
       'q_153NJxO1M', 'qfHZlae8XVU', 'rcFGwuREQFY', 'smg98qv_xa0', 't8VWAr2UicA', 'tH7eOK3Lr1A', 'tVAelwglnH8', 'xAFkE7-Jp88',
       'xim3ocTGn4E', 'xt4blnOS3m8', 'yXE14E0QKNI']
def frame(vid, k):
    p = os.path.join(CACHE, f'{vid}_{k}.jpg')
    if not os.path.exists(p): urllib.request.urlretrieve(f'https://i.ytimg.com/vi/{vid}/{k}.jpg', p)
    return Image.open(p).convert('RGB')
def out(mid, name): d = os.path.join(APP, 'assets', 'modes', mid); os.makedirs(d, exist_ok=True); return os.path.join(d, name)
def save(im, mid, name, w=640):
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    p = out(mid, name)
    if name.endswith('.jpg'): im.save(p, quality=82, optimize=True)
    else: im.save(p, optimize=True)
def card(mid, f, trig='game_start', ms=1600):
    return f"{{ trigger: '{trig}', once: true, effect: {{ type: 'overlay', image: '{A}{mid}/{f}', fit: 'contain', at: 'board', opacity: 1, duration_ms: {ms}, fade_ms: 300 }} }}"
def add_key(s, key, val):
    m = re.search(r'\n(\s*)(todo_pass2|source):', s); i = m.start()
    return s[:i] + f'\n  {key}: {val},' + s[i:]
def add_vfx(s, items):
    js = ', '.join(items); m = re.search(r'\n  vfx_timeline: \[', s)
    if m: return s[:m.end()] + js + ', ' + s[m.end():]
    return add_key(s, 'vfx_timeline', '[' + js + ']')
def path(mid): return os.path.join(APP, 'data', 'modes', mid + '.js')

WIN = {}
for mid in IDS: save(frame(mid, 'maxresdefault'), mid, 'intro.jpg')
save(frame('xAFkE7-Jp88', 'maxres1').crop((450, 365, 850, 530)), 'xAFkE7-Jp88', 'wins.png', 480); WIN['xAFkE7-Jp88'] = 'wins.png'
pop = frame('f4O--Ai7B9A', 'maxres3').crop((445, 190, 770, 500))
for mid in ['f4O--Ai7B9A', 'nFY-Hn6xiOI']: save(pop, mid, 'you_won.png', 400); WIN[mid] = 'you_won.png'
save(frame('jXOg1Py4EoA', 'maxres3').crop((660, 0, 1280, 720)), 'jXOg1Py4EoA', 'victory.jpg', 560); WIN['jXOg1Py4EoA'] = 'victory.jpg'
save(frame('nXpanP8v3pg', 'maxres2').crop((78, 30, 156, 108)), 'nXpanP8v3pg', 'fog.jpg', 96)

for mid in IDS:
    s = open(path(mid)).read(); n = s
    if f"{A}{mid}/intro.jpg" not in n:
        items = [card(mid, 'intro.jpg')] + ([card(mid, WIN[mid], 'win', 2200)] if mid in WIN else [])
        n = add_vfx(n, items)
    if mid == 'hN-WkBw_PRs': n = n.replace("light: '#dfe3e8', dark: '#8a9bb0'", "light: '#dee3e6', dark: '#8ba4a9'")
    if mid == 'iUUoeJL1FvY': n = n.replace("light: '#f0d9b5', dark: '#deae72'", "light: '#fad8aa', dark: '#daad76'")
    if mid == 'jXOg1Py4EoA': n = n.replace("board: { files: 8, ranks: 8, light: '#ebecd0', dark: '#739552' }", "board: { files: 8, ranks: 8, light: '#ccd0d2', dark: '#4e5067' }")
    if n != s: open(path(mid), 'w').write(n); print('ok', mid)
print('done')
