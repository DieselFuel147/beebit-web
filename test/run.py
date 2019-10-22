#!usr/bin/python3

import random
import time
import pycurl

try:
    # python 3
    from urllib.parse import urlencode
    from io import BytesIO
except ImportError:
    # python 2
    from urllib import urlencode
    from StringIO import StringIO as BytesIO

# update interval in minutes this would be read from a config file
update_interval = 0.1

# The UUID would be read from a licence.txt file on the device
uuid = 'AF233DE1CC579B48964C585A3C7126DF'
#uuid = '3573871BA65032C9A7AE104979D55DE9'
#uuid = 'ED5692A7965AA31CC775D7EF417C5F72'

# The idea is there will be more entry points for things like bee/camerafeed ..etc
base = 'http://localhost:3420/'
#base = 'http://app.beebithive.com/'
update_url = base + 'bee/update'


def update(status):
    c = pycurl.Curl()
    c.setopt(c.URL, update_url)
    c.setopt(c.WRITEFUNCTION, buffer.write)

    post_data = {'uuid': uuid, 'status': status, 'people': random.randint(0, 50), 'timestamp': int(time.time())}
    c.setopt(c.POSTFIELDS, urlencode(post_data))

    c.perform()
    http_response_code = c.getinfo(pycurl.HTTP_CODE)

    c.close()
    return http_response_code


# todo: not crash when no connection
while True:
    buffer = BytesIO()
    http_code = update("People Detected")
    response = buffer.getvalue()
    print(response)

    time.sleep(update_interval*60)
