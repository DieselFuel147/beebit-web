CC = g++
CFLAGS = -g -std=c++11 -Wall
SRCS = main.cpp
PROG = cv_body.out

OPENCV = `pkg-config opencv --cflags --libs`
LIBS = $(OPENCV) -lpthread

$(PROG):$(SRCS)
	$(CC) $(CFLAGS) -o $(PROG) $(SRCS) $(LIBS)
