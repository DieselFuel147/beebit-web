import cv2
import numpy as np
import math

point = np.array([-1, -1])

W, H = 512, 512

l1 = np.array([0, 0])
l2 = np.array([W, H])

def lineDist(l1, l2, p):
    x_diff = l2[0] - l1[0]
    y_diff = l2[1] - l1[1]
    num = -(y_diff*p[0] - x_diff*p[1] + l2[0]*l1[1] - l2[1]*l1[0])
    den = math.sqrt(y_diff**2 + x_diff**2)
    return num / den
    
def normalize(v):
    norm = np.linalg.norm(v)
    if norm == 0: 
       return v
    return v / norm
    
def getLineBetween(l1, l2, p):
    lineVec = p + normalize(np.array([l2[1]-l1[1], -(l2[0]-l1[0])]))*lineDist(l1, l2, p)
    return tuple((int(lineVec[0]), int(lineVec[1])))

def click_point(event, x, y, flags, param):
    global point
    if event == 1:
        cv2.circle(img, (x, y), 10, (255, 0, 0), -1)
        point = np.array([x, y])
        print(lineDist(l1, l2, point))
        cv2.line(img, tuple(point), getLineBetween(l1, l2, point), (255, 0, 0), 2)
        print(point)

img = np.zeros((W, H, 3), np.uint8)
cv2.line(img, tuple(l1), tuple(l2), (0, 255, 255), 2)
cv2.namedWindow('image')
cv2.setMouseCallback('image', click_point)

while(1):
    cv2.imshow('image', img)
    
    k = cv2.waitKey(20) & 0xFF
    
    if k == 27:
        break
        

cv2.destroyAllWindows()
