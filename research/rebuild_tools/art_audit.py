#!/usr/bin/env python3
"""Art audit (art-audit-final-b, 2026-11-25): for each mode file, list every image it references with pixel size and
flag missing / low-res / upscaled-looking / JPEG-for-sprite / un-cut background / halo fringe.

usage: python3 research/rebuild_tools/art_audit.py [--ids id1,id2] [--from X1aDgLuvLMU.js] [--shared] [--json out.json]
Run from the repo root or anywhere (paths are resolved from this file).
Heuristics (all approximate; LOOK at flagged files before changing them):
  small     min side < 64 px for pieces/avatars (< 200 for boards/backgrounds/intro images)
  upscaled  image is nearly identical to itself downscaled 2x and back up (soft, interpolated detail); skipped for
            nearest-neighbour pixel art (blocky) which is fine
  jpg_sprite a piece/avatar/overlay referenced as .jpg (no transparency) where pieces need a cut-out
  uncut     piece image has opaque corners (background not removed)
  halo      many semi-transparent or near-white/near-green edge pixels around the cut-out (bad transparency cut)
"""
import os, re, sys, json, glob, argparse
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(HERE, '..', '..')
IMG_RE = re.compile(r"""assets/[A-Za-z0-9_\-./]+?\.(?:png|jpg|jpeg|webp|gif|svg)""")


def role_of(path, ctx):
    p = path.lower()
    c = ctx.lower()
    if 'avatar' in c or '/avatars/' in p:
        return 'avatar'
    if 'board' in os.path.basename(p) or 'image:' in c and 'board' in c:
        return 'board'
    if re.search(r'intro|ending|rulebook|thumb|card|bg|background|screen|scene|full|map|frame', os.path.basename(p)):
        return 'scene'
    if 'img' in c or '/pieces/' in p or re.search(r'/[wb][KQRBNP]\.png$', path):
        return 'piece'
    return 'other'


def analyse(full, role):
    out = {}
    if full.endswith('.svg'):
        out['size'] = 'svg'
        return out, []
    flags = []
    try:
        im = Image.open(full)
        im.load()
    except Exception as e:
        return {'error': str(e)}, ['unreadable']
    w, h = im.size
    out['size'] = f'{w}x{h}'
    out['mode'] = im.mode
    small_lim = 200 if role in ('board', 'scene') else 64
    if min(w, h) < small_lim:
        flags.append(f'small<{small_lim}')
    rgba = np.asarray(im.convert('RGBA')).astype(np.float32)
    a = rgba[..., 3]
    rgb = rgba[..., :3]
    # pixel-art test: fraction of pixels equal to the right neighbour
    same = (np.abs(np.diff(rgb, axis=1)).sum(-1) < 1).mean() if w > 2 else 0
    out['flat'] = round(float(same), 2)
    # upscale test on luminance
    if min(w, h) >= 48 and same < 0.55:
        lum = Image.fromarray((rgb.mean(-1)).astype(np.uint8))
        small = lum.resize((max(1, w // 2), max(1, h // 2)), Image.BICUBIC).resize((w, h), Image.BICUBIC)
        L = np.asarray(lum).astype(np.float32)
        S = np.asarray(small).astype(np.float32)
        mask = a > 200
        if mask.sum() > 100:
            err = np.abs(L - S)[mask].mean()
            var = np.abs(L - L[mask].mean())[mask].mean() + 1e-3
            out['soft'] = round(float(err / var), 3)
            if err / var < 0.06:
                flags.append('upscaled')
    if full.lower().endswith(('.jpg', '.jpeg')) and role in ('piece', 'other'):
        flags.append('jpg_sprite')
    if role == 'piece' and full.lower().endswith('.png'):
        corners = [a[0, 0], a[0, -1], a[-1, 0], a[-1, -1]]
        if min(corners) > 250 and (a < 10).mean() < 0.02:
            flags.append('uncut')
        # halo: edge of the opaque region
        if (a < 10).mean() > 0.05:
            op = a > 128
            edge = op & ~(np.roll(op, 1, 0) & np.roll(op, -1, 0) & np.roll(op, 1, 1) & np.roll(op, -1, 1))
            if edge.sum() > 20:
                e = rgb[edge]
                white = ((e.min(-1) > 225)).mean()
                green = ((e[:, 1] > 140) & (e[:, 1] > e[:, 0] + 40) & (e[:, 1] > e[:, 2] + 40)).mean()
                out['edge_white'] = round(float(white), 2)
                out['edge_green'] = round(float(green), 2)
                if white > 0.35 or green > 0.2:
                    flags.append('halo')
    return out, flags


def mode_refs(path):
    txt = open(path, encoding='utf-8').read()
    refs = []
    for m in IMG_RE.finditer(txt):
        s = max(0, m.start() - 60)
        refs.append((m.group(0), txt[s:m.start()]))
    seen, out = set(), []
    for r, c in refs:
        if r in seen:
            continue
        seen.add(r)
        out.append((r, c))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--ids')
    ap.add_argument('--after', help='only mode files sorting after this filename (C locale)')
    ap.add_argument('--skip', default='')
    ap.add_argument('--shared', action='store_true')
    ap.add_argument('--json')
    ap.add_argument('--flagged', action='store_true')
    o = ap.parse_args()
    files = sorted(os.listdir(os.path.join(APP, 'data', 'modes')))
    if o.ids:
        want = set(o.ids.split(','))
        files = [f for f in files if f[:-3] in want]
    if o.after:
        files = [f for f in files if f > o.after]
    skip = set(filter(None, o.skip.split(',')))
    files = [f for f in files if f[:-3] not in skip]
    report = {}
    if o.shared:
        for f in sorted(glob.glob(os.path.join(APP, 'assets', '*', '*'))):
            if '/modes/' in f or '/sounds/' in f or os.path.isdir(f):
                continue
            rel = os.path.relpath(f, APP)
            role = 'avatar' if '/avatars/' in rel else 'board' if '/boards/' in rel else 'other'
            info, flags = analyse(f, role)
            report.setdefault('_shared', []).append(dict(path=rel, role=role, flags=flags, **info))
        for d in sorted(glob.glob(os.path.join(APP, 'assets', 'pieces', '*'))):
            sizes = set()
            for f in glob.glob(os.path.join(d, '*')):
                if f.endswith('.svg'):
                    sizes.add('svg')
                else:
                    try:
                        sizes.add('%dx%d' % Image.open(f).size)
                    except Exception:
                        sizes.add('?')
            report.setdefault('_pieces', []).append(dict(path=os.path.relpath(d, APP), sizes=sorted(sizes)))
    for f in files:
        rows = []
        for ref, ctx in mode_refs(os.path.join(APP, 'data', 'modes', f)):
            full = os.path.join(APP, ref)
            role = role_of(ref, ctx)
            if not os.path.exists(full):
                rows.append(dict(path=ref, role=role, flags=['MISSING']))
                continue
            info, flags = analyse(full, role)
            rows.append(dict(path=ref, role=role, flags=flags, **info))
        report[f[:-3]] = rows
    if o.json:
        json.dump(report, open(o.json, 'w'), indent=1)
    for k, rows in report.items():
        show = [r for r in rows if r.get('flags')] if o.flagged else rows
        if not show:
            continue
        print(k)
        for r in show:
            print('   ', r.get('path'), r.get('size', r.get('sizes')), r.get('role', ''), ','.join(r.get('flags', [])),
                  {x: r[x] for x in ('soft', 'flat', 'edge_white', 'edge_green') if x in r})


if __name__ == '__main__':
    main()
