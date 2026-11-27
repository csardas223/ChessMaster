#!/usr/bin/env python3
"""Piece-set + board-theme picker QA (themes 2026-11-27).
python3 tools/qa_themes.py [--sizes 390x844,360x780] [--port 8973] [--shots DIR]   (exit 1 on a failure or console error)
Per size: every picker thumbnail loads (all 12 pieces of every set load too), selected state is set, each new option
(pieces neo / duolingo / staunton3d, board duolingo) applies live to the Options preview and to a standard game
(#/play/stockfish), persists in localStorage across a reload, and modes that force their own set keep it
(3D Glasses hZf3G9Pr1UU -> staunton3d, Duolingo Chess eCzxOgc4fTY -> its traced set). With --shots also writes
themes_sheet.png: every piece set and every board, rendered by the app's own CM.settings.pieceUrl / BOARDS."""
import os, sys, threading, http.server, socketserver, functools, argparse
from playwright.sync_api import sync_playwright
ap = argparse.ArgumentParser(); ap.add_argument('--sizes', default='390x844,360x780'); ap.add_argument('--port', type=int, default=8973); ap.add_argument('--shots', default='')
a = ap.parse_args()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *x): pass
socketserver.ThreadingTCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', a.port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = 'http://127.0.0.1:%d/index.html' % a.port
fails = []
def check(n, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + n + ('' if ok else ' ' + str(info)))
    if not ok: fails.append(n)
NEW_PIECES = ['neo', 'duolingo', 'staunton3d']; NEW_BOARDS = ['duolingo']
IGN = ('407', 'TUNNEL', 'cdn.jsdelivr.net', 'raw.githubusercontent.com', 'unpkg.com')

def run(p, size):
    W, H = map(int, size.split('x'))
    def shot(pg, n, full=False):
        if a.shots: pg.screenshot(path=os.path.join(a.shots, '%s_%s.png' % (n, size)), full_page=full)
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': W, 'height': H}, device_scale_factor=2, is_mobile=True, has_touch=True)
    pg = ctx.new_page(); errs = []; bad = []
    pg.on('pageerror', lambda x: errs.append(str(x)))
    pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' and not any(k in m.text for k in IGN) else None)
    rf = []; pg.on('requestfailed', lambda r: rf.append(r.url + ' ' + str(r.failure)))
    pg.on('response', lambda r: bad.append(r.url) if r.status >= 400 and '127.0.0.1' in r.url else None)
    pg.goto(BASE + '#/'); pg.wait_for_function('window.CM && CM.settings && CM.settingsPanel', timeout=20000)
    pg.evaluate('() => localStorage.clear()'); pg.reload(); pg.wait_for_function('window.CM && CM.settings', timeout=20000); pg.wait_for_timeout(600)
    # every set: all 12 images load
    miss = pg.evaluate('''async () => { const S = CM.settings, out = [];
      await Promise.all(Object.keys(S.PIECES).flatMap(k => ['w','b'].flatMap(c => 'PNBRQK'.split('').map(t => new Promise(res => {
        const i = new Image(); i.onload = () => { if (!i.naturalWidth) out.push(k + c + t); res(); }; i.onerror = () => { out.push(k + c + t); res(); }; i.src = S.pieceUrl(c, t, k); })))));
      return out; }''')
    check(size + ' all 12 pieces of every set load', not miss, miss)
    pg.click('#open-settings'); pg.wait_for_timeout(700)
    th = pg.evaluate('() => [...document.querySelectorAll("#settings .swatch img")].filter(i => !i.complete || !i.naturalWidth).map(i => i.src)')
    check(size + ' every picker thumbnail renders', not th, th)
    check(size + ' exactly one board + one piece swatch selected', pg.evaluate('() => [document.querySelectorAll("#settings [data-board][aria-checked=true]").length, document.querySelectorAll("#settings [data-pieces][aria-checked=true]").length]') == [1, 1])
    order = pg.evaluate('() => [...document.querySelectorAll("#settings [data-pieces]")].map(x => x.dataset.pieces).slice(0, 3)')
    check(size + ' picker starts Neo, Staunty, 3D Staunton', order == ['neo', 'staunty', 'staunton3d'], order)
    names = pg.evaluate('() => [...document.querySelectorAll("#settings .swatch > span:last-child")].map(s => s.textContent)')
    check(size + ' names clean (no parentheses/underscores, except "Neo (default)")', all(('(' not in n or n == 'Neo (default)') and '_' not in n for n in names), names)
    shot(pg, 'settings_top')
    # full sheet: scroll body and capture
    pg.evaluate('() => { const s = document.querySelector("#settings-body"); s.scrollTop = 0; }')
    for k in NEW_PIECES:
        pg.locator('#settings [data-pieces="%s"]' % k).scroll_into_view_if_needed(); pg.click('#settings [data-pieces="%s"]' % k); pg.wait_for_timeout(300)
        pv = pg.evaluate('() => [...document.querySelectorAll("#skin-preview img")].map(i => i.getAttribute("src"))')
        check(size + ' preview live: pieces ' + k, pv and all('/pieces/%s/' % k in s for s in pv), pv[:2])
        shot(pg, 'pick_pieces_' + k)
    for k in NEW_BOARDS:
        pg.locator('#settings [data-board="%s"]' % k).scroll_into_view_if_needed(); pg.click('#settings [data-board="%s"]' % k); pg.wait_for_timeout(300)
        bg = pg.evaluate('() => getComputedStyle(document.querySelector("#skin-preview .sq.is-dark")).backgroundColor')
        check(size + ' preview live: board ' + k, bg == 'rgb(242, 244, 245)', bg)
        pg.locator('#skin-preview').scroll_into_view_if_needed(); pg.wait_for_timeout(200); shot(pg, 'pick_board_' + k)
    pg.locator('#settings [data-board="green"]').scroll_into_view_if_needed(); shot(pg, 'selected_state')
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    check(size + ' settings sheet closes', not pg.evaluate('() => document.getElementById("settings").classList.contains("is-open")'))
    # standard game with each new set (board duolingo)
    def game(tag, coords='inside'):
        pg.goto(BASE + '#/play/stockfish'); pg.wait_for_function('CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
        pg.wait_for_timeout(1500); pg.evaluate('(() => { const t = document.querySelector(".tapstart"); if (t) t.click(); })()'); pg.wait_for_timeout(900)
        # play 1.e4 so the shot shows a move + last-move highlight
        for n in ('e2', 'e4'):
            try:
                x, y = pg.evaluate('''n => { const c = CM.gameUI.controller, g = c.V.geo || c.V.g, r = CM.gameUI.board.rectOf(g.parse(n)); return [r.left + r.width / 2, r.top + r.height / 2]; }''', n)
                pg.mouse.click(x, y); pg.wait_for_timeout(200)
            except Exception: pass
        pg.wait_for_timeout(700)
        return pg.evaluate('() => [...document.querySelectorAll("#board img")].map(i => i.getAttribute("src")).filter(Boolean)')
    for k in NEW_PIECES:
        pg.evaluate('k => CM.settings.set("pieces", k)', k)
        src = game(k)
        check(size + ' game uses ' + k, src and all('/pieces/%s/' % k in s for s in src), src[:2])
        broken = pg.evaluate('() => [...document.querySelectorAll("#board img")].filter(i => !i.naturalWidth).length')
        check(size + ' game: no broken piece images (' + k + ')', broken == 0, broken)
        shot(pg, 'game_' + k)
    # duolingo board in game: squares, frame, coords readable
    st = pg.evaluate('''() => { const s = document.querySelector("#board .sq.is-light"), d = document.querySelector("#board .sq.is-dark"), c = document.querySelector("#board .coord");
      return [getComputedStyle(s).backgroundColor, getComputedStyle(d).backgroundColor, getComputedStyle(document.querySelector("#board-wrap")).boxShadow.includes("231, 236, 237"), c ? getComputedStyle(c).color : null, c ? getComputedStyle(c).display : null]; }''')
    check(size + ' game board duolingo squares + frame', st[:3] == ['rgb(255, 255, 255)', 'rgb(242, 244, 245)', True], st)
    check(size + ' coords follow global setting (inside) and are grey', st[3] == 'rgb(155, 176, 187)' and st[4] != 'none', st)
    pg.evaluate('() => CM.settings.set("coords", "off")'); pg.wait_for_timeout(200)
    check(size + ' coords hidden when setting off', pg.evaluate('() => getComputedStyle(document.querySelector("#board .coord")).display') == 'none')
    pg.evaluate('() => CM.settings.set("coords", "inside")')
    # live in-game switch back to green, frame gone
    pg.evaluate('() => CM.settings.set("board", "green")'); pg.wait_for_timeout(200)
    check(size + ' live board switch in game drops frame', not pg.evaluate('() => document.documentElement.classList.contains("has-board-frame")'))
    pg.evaluate('() => CM.settings.set("board", "duolingo")')
    # persistence across reload
    pg.reload(); pg.wait_for_function('window.CM && CM.settings', timeout=20000)
    check(size + ' persists (localStorage) pieces=staunton3d board=duolingo', pg.evaluate('() => [CM.settings.get("pieces"), CM.settings.get("board"), JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => /settings/.test(k)))).pieces]') == ['staunton3d', 'duolingo', 'staunton3d'])
    # forced-set modes keep their own pieces
    pg.evaluate('() => CM.settings.set("pieces", "neo")')
    pg.goto(BASE + '#/play/hZf3G9Pr1UU'); pg.wait_for_function('CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    pg.evaluate('(() => { const t = document.querySelector(".tapstart"); if (t) t.click(); })()'); pg.wait_for_timeout(1000)
    s3 = pg.evaluate('() => [...document.querySelectorAll("#board img")].map(i => i.getAttribute("src")).filter(Boolean)')
    check(size + ' 3D Glasses mode keeps staunton3d with Neo chosen', s3 and all('staunton3d' in s for s in s3), s3[:2])
    pg.goto(BASE + '#/play/eCzxOgc4fTY'); pg.wait_for_function('CM.gameUI && CM.gameUI.controller && CM.gameUI.controller.state', timeout=20000)
    pg.evaluate('(() => { const t = document.querySelector(".tapstart"); if (t) t.click(); })()')
    try: pg.wait_for_selector('#duo-play', timeout=8000); pg.click('#duo-play'); pg.wait_for_timeout(1500)
    except Exception: pass
    sd = pg.evaluate('() => [...document.querySelectorAll("#board img")].map(i => i.getAttribute("src")).filter(Boolean)')
    check(size + ' Duolingo mode keeps its traced set with Neo chosen', sd and all('eCzxOgc4fTY' in s for s in sd), sd[:2])
    shot(pg, 'mode_duolingo_with_neo')
    if size.startswith('390') and a.shots: sheet(pg)
    check(size + ' no 4xx asset responses', not bad, bad[:5])
    # 'Failed to load resource' lines are only excused when every failed request was off-site (engine CDNs, blocked in CI)
    local_rf = [u for u in rf if '127.0.0.1' in u and 'ERR_ABORTED' not in u]   # ERR_ABORTED = our own navigation cancelled an in-flight load
    check(size + ' no failed local requests', not local_rf, local_rf[:5])
    if rf: print('     (off-site requests failed, ignored: %s)' % sorted(set(u.split('/')[2] for u in rf if '127.0.0.1' not in u)))
    errs = [e for e in errs if not (e.startswith('Failed to load resource') and not local_rf)]
    check(size + ' 0 console errors', not errs, errs[:5])
    b.close()

def sheet(pg):
    pg.set_viewport_size({'width': 1200, 'height': 900})
    pg.goto(BASE + '#/'); pg.wait_for_function('window.CM && CM.settings', timeout=20000); pg.wait_for_timeout(500)
    pg.evaluate('''async () => { const S = CM.settings, P = S.PIECES, B = S.BOARDS;
      const d = document.createElement('div'); d.id = 'sheet';
      d.style.cssText = 'position:fixed;inset:0;z-index:9999;overflow:auto;background:#262421;color:#eee;font:13px/1.3 system-ui;padding:16px';
      let h = '<h2 style="margin:0 0 8px">Piece sets (' + Object.keys(P).length + ', picker order) on Green</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';
      Object.keys(P).forEach((k, n) => { h += '<div><div style="display:grid;grid-template-columns:repeat(6,1fr);width:360px">' +
        ['w','b'].flatMap((c, r) => 'PNBRQK'.split('').map((t, f) => '<span style="aspect-ratio:1;background:' + ((r + f) % 2 ? '#739552' : '#ebecd0') + '"><img style="width:100%;height:100%;display:block" src="' + S.pieceUrl(c, t, k) + '"></span>')).join('') +
        '</div><div>' + (n + 1) + '. ' + P[k].name + ' <span style="opacity:.6">(' + k + ', ' + P[k].license + ')</span></div></div>'; });
      h += '</div><h2 style="margin:16px 0 8px">Boards (' + Object.keys(B).length + ', picker order)</h2><div style="display:grid;grid-template-columns:repeat(9,1fr);gap:10px">';
      Object.keys(B).forEach(k => { const t = B[k], li = t.lightImg ? 'url(' + t.lightImg + ') center/cover' : '', di = t.darkImg ? 'url(' + t.darkImg + ') center/cover' : '';
        h += '<div><div style="display:grid;grid-template-columns:repeat(4,1fr);' + (t.frame ? 'box-shadow:0 0 0 4px ' + t.frame + ';' : '') + '">' +
          [...Array(16)].map((_, i) => '<span style="aspect-ratio:1;background:' + (((i >> 2) + i) % 2 ? t.dark + ' ' + di : t.light + ' ' + li) + '"></span>').join('') +
          '</div><div style="margin-top:4px">' + t.name + '</div></div>'; });
      d.innerHTML = h + '</div>'; document.body.appendChild(d);
      await Promise.all([...d.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); }''')
    pg.wait_for_timeout(400)
    hgt = pg.evaluate('() => document.getElementById("sheet").scrollHeight')
    pg.set_viewport_size({'width': 1200, 'height': hgt}); pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(a.shots, 'themes_sheet.png'))

with sync_playwright() as p:
    for sz in a.sizes.split(','): run(p, sz)
print('%d failure(s)' % len(fails)); sys.exit(1 if fails else 0)
