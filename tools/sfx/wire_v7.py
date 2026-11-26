"""Wire the v7 sounds (tools/sfx/modes_v7.py): writes js/core/sound-sets.js, read by js/core/sound.js.
Usage (repo root): python3 tools/sfx/wire_v7.py [--check]   (--check: exit 1 if the file would change)

- TAKES: the shared game-start and its takes; sound.js picks one at random, never the last one twice.
- FAMILIES: a family = the sounds it gives to core events + the mode ids in it. A mode is in at most one family.
- OVERRIDES: a standout mode's own entries, on top of its family.
Order at runtime (js/core/sound.js scope): family < override < the mode's own `sounds` map (v6 and older), so
nothing a mode already designed is replaced. Modes in no family keep the shared start and its takes.
"""
import os, sys, json, glob

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SETS = 'assets/sounds/sets/%s.mp3'
TAKES = {'game-start': ['assets/sounds/game-start.mp3', 'assets/sounds/game-start-2.mp3', 'assets/sounds/game-start-3.mp3',
                        'assets/sounds/game-start-4.mp3']}


def fam(start, capture=None):
    d = {'game-start': SETS % start}
    if capture:
        d['capture'] = SETS % capture
    return d


FAMILIES = {
    # horror / SCP: every Horror Chess video + SCP-096 in the Fog (Powerups category); own starts (v6) still win
    'horror': (fam('hz_start', 'hz_capture'), [
        '-fax07t_o5s', '06OeGk5Iu-s', '4XV3SBMQgXE', 'BYg7rV53WrM', 'HuZlhHnES7M', 'JUlTxosCXuk', 'Ji7frCIfmAQ', 'PDCuJf3SdRY',
        'PGBHL6Nc4X0', 'U67wZoy-1fE', '_Kx4ChHuCgI', 'amA3ARfEoU8', 'byhq5v6BUWg', 'd9oDfmcMJvA', 'gHAmif0TenY', 'lpqVYTH9U-A',
        'mwv48BWl2DY', 'mymJwfSPeFA', 'ndbf05-bvgQ', 's2WDIfvefEk', 'vPEVQgvjoL4', 'xp6Pr-rB4JA', 'xvibqyL-CqQ', 'epzU65ZEdcs']),
    # "Stockfish, but ..." fish bots, Martinfish, How Many Fish, Stockfih
    'fish': (fam('fish_start'), [
        '0rlkE-CYRoc', '2L2yE15BdMg', 'CRrPXR1WuDo', 'DKicZI66j6k', 'MwXcULBxA_s', 'My1sUnkiNfU', 'PSSEOUxNTrE', 'Q6sj5N3oQjI',
        'ROkJSsMOfu0', 'SG_N0fW1YO8', 'SbPYufgaG-I', 'SsOtn3iDkv8', 'TQR5zCSzrqw', 'U6J7XjR_5Ik', 'Uccowk6xbFc', 'Y0LOmrRicgw',
        'Y0zYxMYDDWQ', 'eCC-U9w9RvQ', 'ew6NU1Z_G4k', 'g1i9Bp0WbJs', 'icm-scaredfish', 'mUmTeprNjzU', 'oJu13RUrGl4', 'qJLOLAKx6Fo',
        'tNgzqWiYDFk', 'vDzojyJO3sI', 'vIvVdaTQi3s', 'j5na3lPhw7g', 's-BcakLUV4A']),
    # guns: FPS Chess, Shotgun King (4 videos), Gun King, Sniper Bishops, Bazooka vs Granny
    'guns': (fam('gun_start', 'gun_capture'), [
        'Nz2A-g73_iM', 'PszkLYudcws', 'AvZiSnngZjA', 'NK4Upb_s8Ok', 'pzxXxIsKRRo', '9j7h5kF4X9s', 'AWFB4EzGtDc', 'AoREbapF7y0',
        '7LBERB7y2hs']),
    # explosives: atomic chess, bombs, mines, explosive magic, Martin's fireworks (nukes are an override below)
    'explosive': (fam('boom_start'), [
        'PhcIDwTqQKA', 'b0peFhZs4yU', 'uQ0kzL0-taQ', 'wTudFnunSL0', 'd-4NWgCwzco', 'w15Ev7q2HmI', 'vQ3hLgU6jLA', 'lmmKhSrRn_c',
        '30CbSsx8ixM', '5m6UP0ghvdA', 'JW9VnzQocLk', 'UuuPPo3lBnY', 'Yp7AnbFcgHI', 'YrxMDVnjri8', 'mvPXhAMcT7I', 'patgvfwk5gA']),
    # medieval battle: armies that fight (sword start + steel clash on captures)
    'battle': (fam('sword_start', 'sword_capture'), [
        'boaA9_TjXeU', 'c-_Th-jjfyM', 'zxRM5dD5b7w', 'IbRrzKtieqs', 'jHtJ8zYDF8M', 'G4zH8iKfIi0', 'djfYBXvvaYI']),
    # medieval / fantasy roguelikes and ancient chess (sword start, captures stay their own)
    'medieval': (fam('sword_start'), [
        'Kzt9ItpGtYg', 'zP9TzlgA-W0', '_RFXN1Ye3sY', 'JAz_qMQpI1o', 'rf2HSTXTehE', 'XfDeP9FjZ7w', 'hxwi9DwDUKU', 'o5yiE_GHcrQ',
        '0LO0D0rOif0', '1FKa1LnTDeQ', '4KetMbEVvhI', 'M0rsyuvaTrk', 'WEYUcaJTBso', 'hv_NHWqysZE', 'puKYAUl9x9s', 'ulE3YPZI9Sc']),
    # spells and wizards (magic start + spark burst on captures)
    'magic': (fam('magic_start', 'magic_capture'), [
        '8CtX9G07bMU', 'Ag3KKsIrax4', 'hTTtJIdPVrc', 'q_153NJxO1M', 'ioA1tvVO1qA', 'D1hAji3BgJw', 'A7gdM2GD1b0']),
    # magic without a capture change (Wizard Chess has its own hit; Midas; petrified / stone modes)
    'magic_start': (fam('magic_start'), [
        'DMtaRFMpCWc', 'LiXg0nHrjxg', 'NWxiv9k1yrQ', 'O44sHRw-89k', 'ppwoznHliD8', 'sGXmiyvZDE4']),
    # dragons (roar start + growl-bite captures)
    'dragon': (fam('dragon_start', 'dragon_capture'), [
        'B3wErwlKytA', 'CSjh4NrnxLE', 'Ex0PeXfb39I', 'FBrM-CLBZDA', 'ZZMXaJ0vbgQ', 'cR6r8NZz-CA', 'eJsNNi7rBro', 'fRoyaduwh5I',
        'hMC2ZvGkDEQ', 'o8XcmMCIhIk', 'xu4yhPGGjTg', 'MSNUaDps49U', 'k0EOBEhh85w', 'sv3DeeGsB2E', 'sEXa38X1bhY', 'k_OvayYKZYI',
        'HtNZ9DTxHUs', 'R8gZYKtr-C4', 'XbCdL3oL_18']),
    # video games: Chess Ultimate, Passant, Roblox, Who Takes the Crown, Snake, Survivors, Gambonanza, YouTube Chess,
    # Infinite Craft, Table Tactics, Among Us impostor, Minions (arcade start + punchy KO captures)
    'arcade': (fam('arcade_start', 'arcade_capture'), [
        '1_FSHqyc904', 'CxtttdnwNWk', 'F0nfkeR-QEg', 'FxpWhTj2Cv4', 'I07GcHQtY2o', 'M0Nr98Axpo8', 'dKBSZUzVQ1E', 'ehlf0_asIKo',
        'onr_ABfEMGk', 'pPQDMtvu5rk', 'w4L_Obw74dE', 'wwVvGHfEfPI', '1L_sxGgxX9M', 'OO3XlFQ32i0', 'dkCMhNcZezM', 'dztzDlPfqSI',
        'qZyNuiVbGMI', 'rMSar6g_2HY', 'EqOwqolOZOo', 'jXOg1Py4EoA', 'UzoZVdmGpyc', 'iqfHW2_sMmc', 'zDFsnRE_Gig', 'H_5UviR2nTU',
        'spJibM5qaNQ', 'qqvbb2r2k5I', 'Cs6knoD0INQ', '-TKJGtBKK8U', 'xvlHij1tgk8', 'vzNwF2BH8jg', 'goDcorwxJnA', 'sO-lD2On610',
        'Re3c-3qomgQ', 'UZ79sKLa6z4']),
    # sci-fi, time, portals, dimensions, infinite boards
    'scifi': (fam('scifi_start'), [
        'riHSnaWRQlY', '7csbf0L-uio', 'inm7KvllVu0', '2xysVDt8Qzs', 'hZf3G9Pr1UU', 'XxsQ7s3UYAc', 'fqfCh3CsTJk', 'iUUoeJL1FvY',
        'mf238p7c3bc', 'xlErokL2-4c', 'SMOXF1bSsDk', 'Zc8ljpWtYWQ', 'd8pJkdxtXAA', 'MvVT7xDW4ow', 'wPaOpQw4FoY', 'BbgwPj-u_gs',
        'qSwTtgUWqUw', 'Mg2Upjjo2yg']),
    # puzzles, platformers, mazes, mates to find, gravity and physics
    'puzzle': (fam('puzzle_start'), [
        'RDl-EmbTRWc', 'oAoik9Dj2qQ', 'p6W3yDU-v88', '7lEglazTlo8', 'Vr3WOIRAXoI', 'xg_djfCrRes', 'Pz5ZWCrUQyY', '9S2QuAHo24c',
        '6qVgF1OO_cw', 'YmAkTgcRUsY', 'Hz1J81D8rP4', 'tpXg3mxSfY0', 'DoImibR93tA', 'QrKIKcYN5m4', 'fRZmYTwLE54', 'rx-HCGCNuDo',
        'Ugw05nktuDM', 'aSc3Cs0eo7g', 'y5MBC8OCYlI']),
    # 4-player, team, bughouse, mass multiplayer, arenas and tournaments
    'arena': (fam('arena_start'), [
        '8XmhGMnypjc', 'DZYjyPOvGho', 'IjUqZLgF_xM', 'LK1gJhFKgwU', 'WGuczpW2zds', 'YP-PIQhyGwE', 'h7UFq4r59tM', 'oejsLcLHwoA',
        'Xlke-qcgZlo', 'OVM-2QJ2NFQ', 'mZUViBNWt6E', 'oGP4TUDjSVk', 'tsqxjK8GP10', 'TsA-ro0GZ0I', 'Obcl5GCtNHc', '134MBhzRN2c',
        'ymIg80xvKVE', '7REcDCBnXZ8', 'SJrOiyN2-HA', 'YZjdissxTyA', 'iZQGpWbIwWI', 'wqaQeZHJKhk', 'LjehdkzmCho', 'x-ISu_8MDvY',
        'Fbk0Xbcz728', 'U0WKImOhG0s', 'CONozr99agQ']),
    'dice': (fam('dice_start'), [
        'B5LGzOEZSyo', 'CEkC0TINhm8', 'Cr3j7jf5xXk', 'CuwO5ygTGCM', 'HkeZayq10p8', 'Jg-oNqDOXtg', 'KJYUsRlj_34', 'OcWzHqqeLNg',
        'Rtee8TRU0vg', 'dwiAKx06Q9E', 'eKAOw0yaqyA', 'exMFzra96vo', 'haNXJMir3Zk', 'prd7LxnJtL4', 'vm0JynHlzys']),
    'duck': (fam('duck_start'), ['Bzbzs0K5IBs', 'E2x-QTgBD5k', 'MQAC6oSeQzk', 'TX8zxTIeby4', 'ioUPg_z2KpA', '2Sud5_YAp84', 'Y7KKKTTkwNk']),
    # fog of war and blindfold
    'fog': (fam('fog_start'), ['4EIPARnGSSU', 'EifHtpJlv7g', 'nXpanP8v3pg', 'xt4blnOS3m8', 'LpfXLa5v9Zk', 'fXNw2uIWqgY', 'mgXpcH_bWcY',
                               'D8olpXjblQ0', 'pbtCSkxUg9Y']),
    # bullet, blitz, speedruns, racing kings, clock twists
    'rush': (fam('rush_start'), ['Pp4r8PFPW2w', 'hN-WkBw_PRs', 'GuyllCIRcQI', 'DB81BuB6CdM', 'tfPyy36nwc4', 'vwJw6aaggn8',
                                 'vvCAEWKttT4', 'p49nLVPVmws', 'X-aULHXsAaI', 'ZP5cnusxKgA', 'bLwXpCK_h4k', 'q9-mIuPLroo', '9M2Mj2WFFys']),
}
# Drawback Chess: every mode of that category (filled from the index below); odds: the rest of Challenges & Odds
CATEGORY_FAMILIES = {'Drawback Chess': ('drawback', fam('drawback_start')), 'Challenges & Odds': ('odds', fam('odds_start'))}

OVERRIDES = {
    'xp6Pr-rB4JA': {'game-start': SETS % 'backrooms_start'},        # Backrooms: fluorescent hum, carpet
    'Re3c-3qomgQ': {'game-start': SETS % 'mine_start'},             # Minecraft Blocks
    'UZ79sKLa6z4': {'game-start': SETS % 'mine_start'},             # Speedrunner vs 3 Hunters (Minecraft)
    'sO-lD2On610': {'capture': SETS % 'pac_chomp'},                 # Pac-Man Chess eats
    '0i5a9jD1e5Y': {'game-start': SETS % 'drawback_glitch_start'},  # the glitched Drawback video
    '0VbTOk8X1TY': {'game-start': SETS % 'roulette_start'},         # Chess Roulette (captures stay: its shot is wired)
    'cYVauucyLyQ': {'game-start': SETS % 'roulette_start'},
    '6YEM7m8owJ4': {'game-start': SETS % 'wheel_start'},            # Spinner Wheel x3
    'nick8PeAXLA': {'game-start': SETS % 'wheel_start'},
    'rQQKF0ZZQfg': {'game-start': SETS % 'wheel_start'},
}
for _m in ['5m6UP0ghvdA', 'JW9VnzQocLk', 'UuuPPo3lBnY', 'Yp7AnbFcgHI', 'YrxMDVnjri8', 'mvPXhAMcT7I', 'patgvfwk5gA']:
    OVERRIDES[_m] = {'game-start': SETS % 'nuke_start'}            # the nuke videos


def index():
    src = open(os.path.join(ROOT, 'data', 'modes', 'index.js')).read()
    return json.loads(src[src.index('modeIndex=') + len('modeIndex='):].rstrip().rstrip(';'))


def build():
    idx = index()
    fams, modes, bad = {}, {}, []
    for name, (snd, ids) in FAMILIES.items():
        fams[name] = snd
        for i in ids:
            if i not in idx:
                bad.append('%s: unknown mode id %s' % (name, i))
            if i in modes:
                bad.append('%s: %s already in %s' % (name, i, modes[i]))
            modes[i] = name
    for cat, (name, snd) in CATEGORY_FAMILIES.items():
        fams[name] = snd
        for i, m in sorted(idx.items()):
            if m.get('category') == cat and i not in modes:
                modes[i] = name
    for i in OVERRIDES:
        if i not in idx:
            bad.append('override: unknown mode id %s' % i)
    urls = {u for d in list(fams.values()) + list(OVERRIDES.values()) for u in d.values()} | {u for v in TAKES.values() for u in v}
    for u in sorted(urls):
        if not os.path.exists(os.path.join(ROOT, u)):
            bad.append('missing file ' + u)
    data = {'takes': TAKES, 'families': fams, 'modes': dict(sorted(modes.items())), 'overrides': OVERRIDES}
    js = ('/* generated by tools/sfx/wire_v7.py from its FAMILIES / OVERRIDES tables; do not edit by hand.\n'
          '   SFX v7: the shared game-start takes, the sound set of each mode family, and per-mode overrides.\n'
          '   js/core/sound.js applies them: family < override < the mode\'s own `sounds` map. */\n'
          'window.CM_SOUND_SETS = ' + json.dumps(data, indent=0, sort_keys=False).replace('\n', '') + ';\n')
    return js, bad, modes, idx


def main():
    js, bad, modes, idx = build()
    out = os.path.join(ROOT, 'js', 'core', 'sound-sets.js')
    for b in bad:
        print('ERROR', b)
    cnt = {}
    for f in modes.values():
        cnt[f] = cnt.get(f, 0) + 1
    print('modes with a family: %d / %d; %s; overrides: %d' % (len(modes), len(idx), ', '.join('%s %d' % kv for kv in sorted(cnt.items())), len(OVERRIDES)))
    old = open(out).read() if os.path.exists(out) else ''
    if '--check' in sys.argv:
        sys.exit(1 if bad or old != js else 0)
    if bad:
        sys.exit(1)
    open(out, 'w').write(js)
    print('wrote', os.path.relpath(out, ROOT))


if __name__ == '__main__':
    main()
