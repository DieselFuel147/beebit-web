CC = g++
CFLAGS = -g -Wall
SRCS = main.cpp nms.cpp util.cpp
PROG = bodydetect.out

OPENCV = `pkg-config opencv --cflags --libs`
LIBS = $(OPENCV)

$(PROG):$(SRCS)
	$(CC) $(CFLAGS) -o $(PROG) $(SRCS) $(LIBS)
