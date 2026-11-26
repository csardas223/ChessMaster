"""Group-6 (impl-6, eighth session): the online-vs-humans videos of group 6 show chess.com's own look, so what the video
actually puts on screen beyond the board is: the opponents' chess.com avatars + names + ratings, the player's purple-king
avatar and handle (ireallywantcheckmate), and (Setup Chess / Fog of War) the 1..5 win boxes beside the player bar.
This tool copies those from the real frames (i.ytimg.com/vi/<id>/maxres1-3.jpg) into assets/modes/<id>/opp<N>.png and
wires them into the mode files as params.series = { opponents: [...], boxes } (rotation + boxes live in
js/game/spec-game.js, 'impl-6' comments). Names are the text visible in the frame (chess.com truncates long ones with ...).
Run: python3 tools/g6_series_art.py  (needs numpy; downloads into /tmp/g6t; idempotent)"""
import os, re, json, urllib.request
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__)); APP = os.path.join(HERE, '..'); A = 'assets/modes/'
CACHE = '/tmp/g6t'; os.makedirs(CACHE, exist_ok=True)
ME = {'name': 'ireallywantcheckmate', 'avatar': 'assets/modes/uUXev8TPVak/iwantcheckmate.png'}
# id -> [(frame, name as shown, rating as shown)], boxes
DATA = {
    'f4O--Ai7B9A': ([('maxres1', 'John_Doyl…', 1500), ('maxres2', 'd3sspair', 1522)], 0),
    'hVOA_oScEBQ': ([('maxres2', 'TheCraythi…', 1877), ('maxres3', 'Hyunkel18', 1893)], 0),
    'nFY-Hn6xiOI': ([('maxres1', 'Doubt_Clo…', 1858), ('maxres2', 'romanenko…', 1584), ('maxres3', 'DaRealYou…', 1614)], 5),
    'nXpanP8v3pg': ([('maxres1', 'Juneid777', 1635), ('maxres2', 'RobJo94', 1634), ('maxres3', 'funkyt', 1519)], 5),
    'piiE6JB8pWw': ([('maxres2', 'Klub4Konej', 1460), ('maxres3', 'purrberry', 1479)], 0),
    'q_153NJxO1M': ([('maxres2', 'YyChroniX', 1767)], 0),
    'qfHZlae8XVU': ([('maxres2', 'megan_34', 1472)], 0),
    'smg98qv_xa0': ([('maxres2', 'ChocoCara…', 1597)], 0),
    't8VWAr2UicA': ([('maxres1', 'menduco1…', 1697), ('maxres3', 'BarbarIAN…', 1525)], 0),
    'tH7eOK3Lr1A': ([('maxres1', 'ib_q', 2033), ('maxres2', 'Mahak8160', 2024), ('maxres3', 'Erichoffner', 1947)], 0),
    'tVAelwglnH8': ([('maxres1', 'Janak1324…', 1744), ('maxres3', 'genkiman', 1743)], 0),
    'xAFkE7-Jp88': ([('maxres2', 'antoniomar…', 1606)], 0),
    'xim3ocTGn4E': ([('maxres1', 'AlvinVinz168', 1691), ('maxres2', 'nguyenkha…', 1513), ('maxres3', 'OriginalAn…', 1552)], 0),
    'xt4blnOS3m8': ([('maxres1', 'piethegod', 1488), ('maxres3', 'lucifer9l', 1624)], 5),
    'yXE14E0QKNI': ([('maxres2', 'professork…', 1500), ('maxres3', 'fintarSP', 1597)], 0),
}
# FICS has text-only handles (no avatars) in the frames
TEXT_ONLY = {'hN-WkBw_PRs': [{'name': 'family', 'rating': 1790}, {'name': 'loveflyfishing', 'rating': 1682}, {'name': 'fluters', 'rating': None}]}
OPP_Y = {('yXE14E0QKNI', 'maxres2'): 20}   # the chessboard-thumbnail avatar defeats the row scan

def frame(vid, k):
    p = os.path.join(CACHE, f'{vid}_{k}.jpg')
    if not os.path.exists(p): urllib.request.urlretrieve(f'https://i.ytimg.com/vi/{vid}/{k}.jpg', p)
    return Image.open(p).convert('RGB')

def avatar(vid, k):
    im = frame(vid, k); a = np.asarray(im).astype(int)
    m = (a[..., 0] > 90) & (a[..., 0] < 200) & (a[..., 1] < 70) & (a[..., 2] > 160)   # the player's purple avatar
    lab, _ = ndimage.label(m); best = None
    for i, sl in enumerate(ndimage.find_objects(lab)):
        h = sl[0].stop - sl[0].start; w = sl[1].stop - sl[1].start; s = (lab[sl] == i + 1).sum()
        if 0.75 < h / w < 1.33 and 20 < w < 90 and s > 0.5 * h * w and s > 300: best = (sl[1].start, sl[0].start, w, h)
    x, y, w, h = best
    diff = np.abs(a[:, x + 3:x + w - 3] - np.array([46, 44, 41])).sum(-1) > 35
    rows = diff.mean(1); oy = OPP_Y.get((vid, k))
    if oy is None: oy = next(yy for yy in range(0, y - 80) if rows[yy:yy + h - 4].mean() > 0.85)
    win = np.abs(a[max(0, oy - 6):oy + h + 6, x + 4:x + w - 4] - np.array([46, 44, 41])).sum(-1) > 70
    ys, xs = np.nonzero(win); y0 = max(0, oy - 6) + ys.min(); y1 = max(0, oy - 6) + ys.max() + 1
    side = min(w, y1 - y0)
    return im.crop((x, y0, x + side, y0 + side)).resize((96, 96), Image.LANCZOS)

def js(v): return json.dumps(v, ensure_ascii=False).replace('"', "'")

def wire(mid, opps, boxes):
    p = os.path.join(APP, 'data', 'modes', mid + '.js'); s = open(p).read(); n = s
    first = opps[0]
    n = re.sub(r"opponent: \{ name: (?:'[^']*'|\"[^\"]*\"), rating: [^,]+,(?: avatar: [^,]+,)?",
               "opponent: { name: %s, rating: %s, avatar: %s," % (js(first['name']), js(first.get('rating')), js(first.get('avatar'))), n, 1)
    if mid not in TEXT_ONLY and not re.search(r'\n  player: ', n):
        n = re.sub(r'\n  opponent: ', "\n  player: { name: '%s', rating: null, avatar: '%s' },   /* iwantcheckmate's chess.com handle + purple-king avatar from the frames */\n  opponent: " % (ME['name'], ME['avatar']), n, 1)
    ser = {'opponents': opps}
    if boxes: ser['boxes'] = boxes
    ser_js = 'series: ' + js(ser).replace("'opponents'", 'opponents').replace("'boxes'", 'boxes').replace("'name'", 'name').replace("'rating'", 'rating').replace("'avatar'", 'avatar')
    if mid == 'q_153NJxO1M' or len(opps) < 2 and not boxes: ser_js = None   # one opponent: the opponent line is enough
    if ser_js and 'series:' not in n:
        if re.search(r'\n  params: \{', n): n = re.sub(r'\n  params: \{', '\n  params: { ' + ser_js + ',', n, 1)
        else: n = re.sub(r'\n  (hooks|vfx_timeline|source):', '\n  params: { ' + ser_js + ' },\n  \\1:', n, 1)
    if n != s: open(p, 'w').write(n); print('wired', mid)

if __name__ == '__main__':
    for mid, (frames, boxes) in DATA.items():
        d = os.path.join(APP, 'assets', 'modes', mid); os.makedirs(d, exist_ok=True); opps = []
        for i, (k, name, rating) in enumerate(frames, 1):
            avatar(mid, k).save(os.path.join(d, f'opp{i}.png'), optimize=True)
            opps.append({'name': name, 'rating': rating, 'avatar': f'{A}{mid}/opp{i}.png'})
        wire(mid, opps, boxes)
    for mid, opps in TEXT_ONLY.items(): wire(mid, opps, 0)
