import time
import datetime
import picamera
import sys

# set name as timestamp YYYY-mm-dd HH.MM.SS
ts = time.time()
name = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d %H.%M.%S')

# get video length
duration = 10
if len(sys.argv) > 1:
    duration = int(sys.argv[1])

# load camera, set resolution
camera = picamera.PiCamera()
camera.resolution = (640, 480)

# start recording
camera.start_recording('snaps/' + name + '.h264')
camera.wait_recording(duration)
camera.stop_recording()
