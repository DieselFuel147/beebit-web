CC = g++
CFLAGS = -g -Wall
SRCS = main.o nms.o util.o
PROG = bodydetect.out

OPENCV = `pkg-config opencv --cflags --libs`
RASPI = -I/usr/local/include/ -lraspicam -lraspicam_cv 
MMAL = -L/opt/vc/lib -lmmal -lmmal_core -lmmal_util

LIBS = $(OPENCV) $(RASPI) $(MMAL) -lpthread

$(PROG):$(SRCS)
	$(CC) $(CFLAGS) -o $(PROG) $(SRCS) $(LIBS)

main.o : main.cpp nms.hpp util.h
	$(CC) $(LIBS) -c main.cpp

nms.o : nms.cpp nms.hpp util.h
	$(CC) $(LIBS) -c nms.cpp

util.o : util.cpp util.h
	$(CC) $(LIBS) -c util.cpp

