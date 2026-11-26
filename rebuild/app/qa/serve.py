#!/usr/bin/env python3
"""Static server for QA: same as `python3 -m http.server`, but sends no-store so edits are always picked up."""
import functools
import http.server
import socketserver
import sys
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 3000


class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('0.0.0.0', PORT), functools.partial(H, directory=ROOT)) as s:
    print('serving', ROOT, 'on', PORT, flush=True)
    s.serve_forever()
