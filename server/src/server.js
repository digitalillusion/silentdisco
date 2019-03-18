const request = require('request');
const http = require('http');
const path = require('path');
const stream = require('stream');
const express = require('express');
const socketIo = require('socket.io');
const timesyncServer = require('timesync/server');
const lame = require('lame');

const app = express()
const viewsDir = path.join(__dirname, '..', 'public')
app.use(express.static(viewsDir))
app.engine('html', require('ejs').renderFile)
app.set('views', viewsDir)
app.set('view engine', 'html')
app.get('/', function(req, res) {
    res.render('index.ejs', {
        serverIp : process.env.SERVER_IP
    })
})
app.use('/timesync', timesyncServer.requestHandler);

const server = http.createServer(app);
const io = socketIo(server, {
  path: '/silentdisco',
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false
})
server.listen(3000);

let connections = []
io.on('connection', function (socket) {
  connections.push(socket)
});
io.on('disconnect', function (socket) {
  connections.splice(connections.indexOf(socket), 1)
});

const mp3stream = request(process.env.STREAM_URL)

let chunks = Buffer.alloc(0)
const PACKET_LENGTH = 8192

mp3stream
  .pipe(new lame.Decoder())
  .pipe(new lame.Encoder({
    channels: 2,
    bitDepth: 16,
    sampleRate: 44100,
    bitRate: 64,
    outSampleRate: 22050,
    mode: lame.MONO
  }))
  .on('data', chunk => {
    chunks = Buffer.concat([chunks, chunk])
    if (chunks.length > PACKET_LENGTH) {
        let packet = chunks.slice(0, PACKET_LENGTH)
        chunks = chunks.slice(PACKET_LENGTH)
        io.emit('stream_data', packet)
    }
})

