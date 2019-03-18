silentdisco
===========

#### Launch azuracast

In _silentdisco_ root folder execute:

     ./docker.sh install

Log in to localhost:8080 and complete the configuration


#### Launch server

The azuracast stream is propagated to the network by a nodejs server; it reads the stream and broadcasts it to all connected websockets.


In _silentdisco/server_ folder execute the command to build and run the application, specifying the environment variables 
 * _SERVER_IP_: the ip address of the machine on the lan
 * _STREAM_URL_: the URL of the azuracast stream
 
 An example of the launch script would be as follows:
 

     export SERVER_IP=192.168.1.46
     export STREAM_URL=http://192.168.1.46:8000/radio.mp3
     docker-compose up -d --build
     
In order to see the execution logs you may run the following command (where `server_silentdisco_1` is the name of the container generated by the build):

     docker logs server_silentdisco_1

When everything is setup, the clients may connect to the server using a web browser

#### Performance note

The server relies on `io.emit()` in order to broadcast the stream as fast as possible with fixed packet size. 
In order to reduce the amount of exchanged data, a mono mixdown is performed.
On client side the major bottleneck is represented by the time needed by `AudioContext.decodeAudioData()`, expecially on less modern devices.
The delay needed to synchronize the streams is applied with amortization, otherwise would result in choppy playback: it takes around a minute to synchronize two devices having 500 ms of difference in latency

#### Credits

_silentdisco_ is using the following third party software:

* azuracast https://www.azuracast.com/
* socket.io https://socket.io/
* timesync https://github.com/enmasseio/timesync
