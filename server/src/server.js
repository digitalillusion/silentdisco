const request = require('request');
const http = require('http');
const path = require('path');
const stream = require('stream');
const express = require('express');
const socketIo = require('socket.io');

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
let chunks = [];
const PACKET_LENGTH = 64
mp3stream.on('data', chunk => {
    chunks.push(chunk);
    if (chunks.length > PACKET_LENGTH) {
        let packet = Buffer.concat(chunks.splice(0, PACKET_LENGTH))
        for (let socket of connections) {
            socket.emit('stream_data', { time : Date.now(), data : packet })
        }
    }
})
