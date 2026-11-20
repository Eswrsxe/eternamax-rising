#!/usr/bin/env python3
"""Servidor local do Eternamax Rising. Uso: python3 serve.py [porta]  (padrão 8158)
- Multi-thread (várias conexões ao mesmo tempo, sem travar ao trocar de rota)
- URLs limpas: /comunidade -> comunidade/index.html (sem redirect)
- Fecha a conexão após cada resposta (nada de keep-alive preso)"""
import os, sys, mimetypes
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
ROOT = os.path.dirname(os.path.abspath(__file__))
class H(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.0"
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def translate_path(self, path):
        p = super().translate_path(path.split("?")[0].split("#")[0])
        if os.path.isdir(p):
            idx = os.path.join(p, "index.html")
            if os.path.exists(idx): return idx
        elif not os.path.exists(p) and os.path.exists(os.path.join(p, "index.html")):
            return os.path.join(p, "index.html")
        return p
    def send_head(self):
        # /rota (sem barra) serve direto, sem 301
        raw = self.path.split("?")[0]
        if raw != "/" and not raw.endswith("/"):
            d = os.path.join(ROOT, raw.lstrip("/"))
            if os.path.isdir(d) and os.path.exists(os.path.join(d, "index.html")):
                self.path = raw + "/"
        return super().send_head()
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "close")
        super().end_headers()
    def log_message(self, f, *a): pass
if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8158
    s = ThreadingHTTPServer(("0.0.0.0", port), H); s.daemon_threads = True
    print(f"Eternamax Rising em http://localhost:{port}"); s.serve_forever()
