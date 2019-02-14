silentdisco
===========

#### Launch azuracast

In _silentdisco_ root folder execute:

     ./docker.sh install

Log in to localhost:8080 and complete the configuration


#### Launch server

The azuracast stream is propagated to the P2P netwok by a first peer that acts as a server; it reads the stream and forwards it to all registered peers.


In _silentdisco/server_ root folder execute the command to build and run the application, specifying the environment variables 
 * _SERVER_IP_: the ip address of the machine on the lan
 * _STREAM_URL_: the URL of the azuracast stream
 
 An example of the launch script would be as follows:
 

     export SERVER_IP=192.168.1.46
     export STREAM_URL=http://192.168.1.46:8000/radio.mp3
     docker-compose up -d --build
     
In order to see the execution logs you may run the following command (where `server_silentdisco_1` is the name of the container generated by the build):

     docker logs server_silentdisco_1


#### Disclaimer

The synchronization is not perfect since the server clock is estimated, but it is adaptively convergent in case of devices that have the same network delay.
It means that the devices may start out of sync, but thei will get along in sync more precisely as soon as many clock and latency measurations are done.
The server relies on `io.emit()` in order to broadcast the stream; expect the overall performance to degrade as the number of connection raises

#### Credits

_silentdisco_ is using the following third party libraries:

* socket.io https://socket.io/
* ServerDate https://github.com/NodeGuy/ServerDate
