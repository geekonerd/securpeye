import time
import datetime
from time import sleep
from picamera import PiCamera

# set filename as timestamp YYYY-mm-dd HH.MM.SS
ts = time.time()
name = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H.%M.%S')

# load camera, set resolution
camera = PiCamera()
camera.resolution = (1024, 768)

# warm-up time
sleep(1)

# cheese!
camera.capture('snaps/' + name + '.jpg')
