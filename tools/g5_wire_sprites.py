#!/usr/bin/env python3
"""Group 5: ship every reference sprite of the group's videos (research/frames/sprites/<id>_<thing>.png) in its mode.
Owner 2026-11-24: all mode art copied directly from the videos. Each sprite is cut (thumbnail art on the purple
backdrop -> backdrop removed; on-board crops -> square background keyed out for pieces) into assets/modes/<id>/,
then wired into the mode file in the role it plays in the video:
  intro   : shown over the board for 1.6 s when a game starts (the video's title/thumbnail art for the mode)
  avatar  : opponent avatar
  ladder  : avatar of one opponent of a g5_ladder gauntlet (matched by name)
  piece   : image of a piece type (white = the video art, black = a darkened copy unless the video has its own)
  pieces4 : one image per 4-player colour letter
Idempotent: run again after editing SPEC.  python3 tools/g5_wire_sprites.py [id ...]"""
import os, re, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from g5_frames import sprite, demag, flood_key, open_keep, trim, square, darken, save, DST

APP = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')

def magenta_bg(im):
    w, h = im.size; px = im.convert('RGB').load(); n = 0; pts = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (0, h // 2)]
    for p in pts:
        r, g, b = px[p]
        if g < 0.45 * min(r, b) and r + b > 90: n += 1
    return n >= 3
def cut(vid, thing, mode):
    """mode: 'art' (keep the whole picture, backdrop removed if purple), 'piece' (transparent, trimmed, square)"""
    im = sprite('%s_%s.png' % (vid, thing)); w, h = im.size
    if magenta_bg(im):
        im = demag(im)
        if mode == 'piece': im = open_keep(im, (w // 2, h // 2), 2)
        im = trim(im)
    elif mode == 'piece':
        im = trim(open_keep(flood_key(im, 40), (w // 2, h // 2), 1))
    if mode == 'piece': im = square(im)
    return im

# role lists per video id: (sprite thing, role, arg)
SPEC = {
    'D1hAji3BgJw': [('unicorn_knight', 'intro', None)],
    'DB81BuB6CdM': [('speed_timer', 'intro', None)],
    'DZYjyPOvGho': [('red_king_overlay', 'intro', None)],
    'EifHtpJlv7g': [('fog_icon', 'intro', None), ('fog_tile', 'asset', None)],
    'G4zH8iKfIi0': [('goblin_bot', 'ladder', 'Bentnoze and Wartface'),  # wizard_bot sprite is a 30 px blur: not shipped
                     ('goblin_bot', 'intro', None)],
    'GuyllCIRcQI': [('chaturanga_pieces', 'intro', None)],
    'Hz1J81D8rP4': [('castle_mate', 'intro', None), ('martin_wheel', 'avatar', None)],
    'I07GcHQtY2o': [('ninjas_and_ghost', 'intro', None), ('piece_roster', 'asset', None), ('ban_phase', 'asset', None), ('board_with_pits', 'asset', None)],
    'JcpCAs1a2gc': [('anarchy_bot_avatar', 'avatar', None), ('anarchy_knight', 'intro', None), ('reddit_post', 'asset', None)],
    'LpfXLa5v9Zk': [('blindfold', 'intro', None), ('blindfold_view', 'asset', None)],
    'M0Nr98Axpo8': [('ninja', 'intro', None)],  # devil/giant sprites are tiny blurs; CU character art still todo (impl_5_report),
    'MvVT7xDW4ow': [('chatgpt_logo', 'avatar', None), ('chatgpt_logo', 'intro', None)],
    'NWxiv9k1yrQ': [('moai', 'intro', None), ('petrified_piece', 'asset', None), ('petrified_rook', 'asset', None)],
    'O44sHRw-89k': [('moai', 'intro', None), ('petrified_piece', 'asset', None)],
    'NbMW2bOMO5k': [('killer_king_award', 'intro', None)],
    'OFtVdbxJI2Y': [('fly', 'avatar', None), ('fly_connectome', 'intro', None)],
    'OO3XlFQ32i0': [('passant_logo', 'intro', None), ('move_dot', 'asset', None), ('arrow_tile', 'asset', None), ('unstable_tile', 'asset', None)],
    'OVM-2QJ2NFQ': [('boat_red', 'piece4', ('R', 'r')), ('boat_blue', 'piece4', ('R', 'u')), ('boat_yellow', 'piece4', ('R', 'b')), ('boat_green', 'piece4', ('R', 'g')), ('boat_red', 'intro', None)],
    'OWbQgMUwgBQ': [('torpedo_pawn', 'intro', None)],
    'RnMKtGgKknQ': [('torpedo_pawn', 'intro', None)],
    'PPe7vscru0o': [('hill_icon', 'intro', None)],
    'PhcIDwTqQKA': [('atomic_icon', 'intro', None)],
    'b0peFhZs4yU': [('atomic_icon', 'intro', None)],
    'QXSrAkEF744': [('sinta_bot', 'ladder', 'SINTA'), ('sinta_bot', 'intro', None)],
    'QrKIKcYN5m4': [('caged_king', 'intro', None), ('red_yellow_board', 'asset', None)],
    'RDl-EmbTRWc': [('red_king', 'avatar', None), ('blue_lineup', 'intro', None), ('blue_piece', 'asset', None), ('wall_tile', 'asset', None), ('hole_tile', 'asset', None)],
    'SMOXF1bSsDk': [('abyss', 'intro', None), ('void_board', 'asset', None)],
    'SaLxG36hldw': [('crazyhouse_icon', 'intro', None), ('pocket', 'asset', None)],
    'TTimDDC4Cwc': [('hawk', 'piece', 'H'), ('hawk', 'intro', None)],
    'U0WKImOhG0s': [('three_check_icon', 'intro', None)],
    'UzoZVdmGpyc': [('crowned_pawn', 'intro', None), ('teal_tile', 'asset', None)],
    'Vr3WOIRAXoI': [('maze_creature', 'intro', None), ('maze_board', 'asset', None), ('maze_wall', 'asset', None)],
    'WNAxheS0e7E': [('chess960_icon', 'intro', None)],
    'X-aULHXsAaI': [('checkered_flag', 'intro', None)],
    'XfDeP9FjZ7w': [('chaturanga_elephant', 'intro', None)],  # on-board crops too small to key into pieces,
    'Xlke-qcgZlo': [('four_kings', 'intro', None), ('trophy', 'asset', None)],
    'Zc8ljpWtYWQ': [('board_layout', 'intro', None), ('king_check_badge', 'asset', None)],
    '_qxqjb3DseA': [('evil_egg', 'intro', None)],
    'aK1cIhZDzkI': [('sideways_pawn_icon', 'intro', None)],
    'boaA9_TjXeU': [('bot_icon', 'avatar', None), ('bot_icon', 'intro', None)],
    'c-_Th-jjfyM': [('war_board', 'intro', None), ('stone_wall', 'asset', None), ('colored_kings_walls', 'asset', None)],
    'Nz2A-g73_iM': [('ak_pawn', 'intro', None)],
    'cigOpktP92s': [('gothic_piece_crowned', 'intro', None), ('gothic_piece_horned', 'asset', None)],
}

def rel(vid, name): return 'assets/modes/%s/%s' % (vid, name)
def patch(vid, roles):
    p = os.path.join(APP, 'data', 'modes', vid + '.js'); s = open(p).read(); o = s
    for (thing, role, arg, path, bpath) in roles:
        if role == 'avatar':
            m = re.search(r'opponent:\s*\{', s)
            if m and path not in s[m.end():m.end() + 400]:
                seg = s[m.end():m.end() + 400]
                q = '"' if seg.lstrip().startswith('"') else "'"
                s = re.sub(r'(opponent:\s*\{[^{}]*?)(,?\s*["\']?avatar["\']?\s*:\s*["\'][^"\']*["\'])', r'\1', s, count=1)
                m = re.search(r'opponent:\s*\{', s)
                key = '"avatar"' if q == '"' else 'avatar'
                s = s[:m.end()] + ' %s: %s%s%s,' % (key, q, path, q) + s[m.end():]
            elif not m:
                s = re.sub(r'(\n\s*board:)', "\n  opponent: { avatar: '%s' },\\1" % path, s, count=1)
        elif role == 'ladder':
            for qn in ('"name": "%s"' % arg, "name: '%s'" % arg):
                i = s.find(qn)
                if i >= 0 and path not in s[i:i + 300]:
                    ins = (', "avatar": "%s"' if qn.startswith('"') else ", avatar: '%s'") % path
                    s = s[:i + len(qn)] + ins + s[i + len(qn):]
        elif role in ('piece', 'piece4'):
            t, col = (arg, None) if role == 'piece' else arg
            m = re.search(r'(["\']?)%s\1\s*:\s*\{' % re.escape(t), s[s.find('pieces'):]) if 'pieces' in s else None
            if not m: print('  !! no piece', t, 'in', vid); continue
            a = s.find('pieces') + m.end()
            if role == 'piece':
                img = "img: { w: '%s', b: '%s' }, " % (path, bpath)
                if path not in s: s = s[:a] + ' ' + img + s[a:]
            else:
                # collect all colours in one img object
                if 'img: {' not in s[a:a + 200] and '"img": {' not in s[a:a + 200]: s = s[:a] + " img: { }," + s[a:]
                j = s.find('{', s.find('img', a)) + 1
                if path not in s: s = s[:j] + " %s: '%s'," % (col, path) + s[j:]
        elif role == 'intro':
            eff = "{ type: 'overlay', at: 'board', image: '%s', fit: 'contain', duration_ms: 1600, id: 'g5intro' /* video art */ }" % path
            if path in s and "g5intro" in s: continue
            m = re.search(r'\n(\s*)["\']?vfx["\']?\s*:\s*\[', s)
            if m: s = s[:m.end()] + eff + ', ' + s[m.end():]
            else:
                k = re.search(r'\n(\s*)["\']?(hooks|source|todo_pass2|_deferred)["\']?\s*:', s)
                s = s[:k.start()] + '\n' + k.group(1) + 'vfx: [' + eff + '],' + s[k.start():]
    if s != o: open(p, 'w').write(s); print('patched', vid)

if __name__ == '__main__':
    only = sys.argv[1:]
    for vid, roles in SPEC.items():
        if only and vid not in only: continue
        done = []
        for (thing, role, arg) in roles:
            if role in ('piece', 'piece4'):
                im = cut(vid, thing, 'piece'); name = thing + '.png'; save(im, vid + '/' + name, 160)
                bpath = None
                if role == 'piece': save(darken(im, 0.42), vid + '/' + thing + '_b.png', 160); bpath = rel(vid, thing + '_b.png')
                done.append((thing, role, arg, rel(vid, name), bpath))
            else:
                if role == 'asset': continue  # shipped later when the mode uses it (tiles, boards)
                im = cut(vid, thing, 'art' if role == 'intro' else 'piece')
                name = thing + '.png'; save(im, vid + '/' + name, 320 if role in ('intro', 'asset') else 160)
                if role != 'asset': done.append((thing, role, arg, rel(vid, name), None))
        patch(vid, done)
