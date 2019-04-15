# USAGE
# python detect.py --images images

# import the necessary packages
from __future__ import print_function
from imutils.object_detection import non_max_suppression
from imutils import paths
import numpy as np
import argparse
import imutils
import cv2

capture = cv2.VideoCapture(0);

# initialize the HOG descriptor/person detector
hog = cv2.HOGDescriptor()
hog.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

while True:
	# load the image and resize it to (1) reduce detection time
	# and (2) improve detection accuracy
	ret, image = capture.read()
	image = imutils.resize(image, width=min(400, image.shape[1]))
	orig = image.copy()

	# detect people in the image
	(rects, weights) = hog.detectMultiScale(image, winStride=(4, 4),
		padding=(8, 8), scale=1.05)

	# apply non-maxima suppression to the bounding boxes
	rects = np.array([[x, y, x + w, y + h] for (x, y, w, h) in rects])
	pick = non_max_suppression(rects, probs=None, overlapThresh=0.65)

	# draw the final bounding boxes
	for (xA, yA, xB, yB) in pick:
		cv2.rectangle(image, (xA, yA), (xB, yB), (0, 255, 0), 4)

	# show some information on the number of bounding boxes
	print("[INFO] People: {}".format(len(pick)))
	
	image = imutils.resize(image, width=1280, height=720)
    
	# show the output images
	cv2.imshow("After NMS", image)
	cv2.waitKey(1)
