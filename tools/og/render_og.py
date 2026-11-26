"""Render tools/og/og-default.html to assets/og/og-default.png (1200x630 link-preview card for index.html).
Usage (repo root): python3 tools/og/render_og.py   (needs Playwright + Chromium)."""
import os
from playwright.sync_api import sync_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 630})
    pg.goto('file://' + os.path.join(ROOT, 'tools', 'og', 'og-default.html')); pg.wait_for_timeout(800)
    out = os.path.join(ROOT, 'assets', 'og', 'og-default.png'); pg.screenshot(path=out); b.close()
print('wrote', out, os.path.getsize(out), 'bytes')
