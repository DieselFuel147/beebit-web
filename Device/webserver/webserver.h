#pragma once

#include <sys/socket.h>
#include <netinet/in.h>

namespace beeweb {

/**
 * Dead simple TCP web server, to be used on the BeeBit device.
 * Created by Win
 */
class Server {

public:
    // Initialize a local server on the specified port
    Server(const unsigned int port);

    // Listener function
    void start();
    void stop();

    // Check if the server is successfully open to receive packets.
    bool isOpen();

private:
    // Server keepalives
    int server_fd;
    sockaddr_in address;

    bool open = false;

    void debug(const char* info);
};

}