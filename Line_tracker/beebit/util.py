import numpy as np
import math

def lineDist(l1, l2, p):
    x_diff = l2[0] - l1[0]
    y_diff = l2[1] - l1[1]
    num = -(y_diff*p[0] - x_diff*p[1] + l2[0]*l1[1] - l2[1]*l1[0])
    den = math.sqrt(y_diff**2 + x_diff**2)
    return num / den
    
def getLineBetween(l1, l2, p):
    lineVec = p + normalize(np.array([l2[1]-l1[1], -(l2[0]-l1[0])]))*lineDist(l1, l2, p)
    return tuple((int(lineVec[0]), int(lineVec[1])))
    
def normalize(v):
    norm = np.linalg.norm(v)
    if norm == 0: 
       return v
    return v / norm
