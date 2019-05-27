CC = g++
CFLAGS = -g -Wall
SRCS = main.cpp nms.cpp util.cpp
PROG = bodydetect.out

OPENCV = `pkg-config opencv --cflags --libs`
RASPI = -I/usr/local/include/ -lraspicam -lraspicam_cv 
MMAL = -L/opt/vc/lib -lmmal -lmmal_core -lmmal_util

LIBS = $(OPENCV) $(RASPI) $(MMAL) -lpthread

$(PROG):$(SRCS)
	$(CC) $(CFLAGS) -o $(PROG) $(SRCS) $(LIBS)
