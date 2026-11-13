"""
Lightweight development and local hosting server for Khutwa Ramadan App.
Run this script: python server.py
Open in browser: http://localhost:8080
"""
import http.server
import socketserver
import os
import socket

PORT = 8085
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    local_ip = get_local_ip()
    print("=" * 60)
    print("🌙 تطبيق أبواب الجنان لرمضان - السيرفر المحلي يعمل بنجاح")
    print(f"📱 على هذا الجهاز:    http://localhost:{PORT}")
    print(f"📲 من هاتفك (بنفس الواي فاي): http://{local_ip}:{PORT}")
    print("=" * 60)
    print("اضغط Ctrl + C لإيقاف السيرفر.\n")
    
    server_cls = getattr(http.server, 'ThreadingHTTPServer', socketserver.TCPServer)
    with server_cls(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nتم إيقاف السيرفر بنجاح.")
