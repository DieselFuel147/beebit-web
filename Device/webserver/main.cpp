
#include <iostream>

#include "webserver.h"

int main(int argc, char *argv[]) {

    // Create a web server instance and run it.
    beeweb::Server webServer(8080);

    webServer.start();

    return 0;
}
