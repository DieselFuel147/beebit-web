#include "webserver.h"

#include <unistd.h>
#include <string.h>

#include <iostream>

namespace beeweb {

Server::Server(const unsigned int port) {

    // Create and open a socket
    if ((server_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP)) == 0) {
        // Socket creation failed.
        debug("Couldn't create socket file descriptor.");
        return;
    }

    int opt_reuse = 1;

    // Set the socket to reuse the address and port
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR | SO_REUSEPORT, &opt_reuse, sizeof(opt_reuse))) {
        debug("Couldn't set socket options.");
        return;
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons( port );

    if (bind(server_fd, (struct sockaddr *)&address,  
                                 sizeof(address))<0) 
    { 
        debug("Bind port failed.");
        return;
    } 

    this->open = true;
}

void Server::start() {
    char *hello = 
    "HTTP/1.1 200 OK\n"
    "Date: Thu, 19 Feb 2009 12:27:04 GMT\n"
    "Server: Apache/2.2.3\n"
    "Last-Modified: Wed, 18 Jun 2003 16:05:58 GMT\n"
    "ETag: \"56d-9989200-1132c580\"\n"
    "Content-Type: text/html\n"
    "Content-Length: 6\n"
    "Accept-Ranges: bytes\n"
    "Connection: close\n"
    "\n"
    "Hello!";

    if (listen(server_fd, 3) < 0) {
        this->open = false;
        debug("Error opening listener");
    }

    debug("Server Started.");

    // Listen to any incoming connections and respond with something
    while (this->open) {
        int client_socket;
        int add_len = sizeof(address);

        client_socket = accept(server_fd, (struct sockaddr*)&address, (socklen_t*)&add_len);

        if (client_socket < 0) {
            this->open = false;
            break;
        }

        send(client_socket, hello, strlen(hello), 0);
        debug("Message sent to a listener.");
    }

    close(server_fd);
    std::printf("Server stopped with code %d", 1);
}

void Server::stop() {
    this->open = false;
}

void Server::debug(const char *msg) {
    std::cout << "SERVER: " << msg << std::endl;
}

}