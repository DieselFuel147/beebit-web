#!/usr/bin/env python

from http.server import BaseHTTPRequestHandler, HTTPServer
from subprocess import check_output
import sys

class S(BaseHTTPRequestHandler):
    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.send_header('Access-Control-Allow-Origin', 'null')
        self.end_headers()

    def do_GET(self):
        self._set_headers()

        # Run the people detector and get the output
        num_people = check_output("./bodydetect.out").decode(sys.stdout.encoding)

        self.wfile.write(bytearray(num_people, "utf-8"))

    def do_HEAD(self):
        self._set_headers()
        
def run(server_class=HTTPServer, handler_class=S, port=3182):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print('Starting httpd...')
    httpd.serve_forever()

if __name__ == "__main__":
    from sys import argv

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run()
