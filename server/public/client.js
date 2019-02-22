function Client(params) {
  this.socket = io(params.server, {
    path: '/silentdisco'
  });
  this.ts = timesync.create({
    server: '/timesync',
    interval: 60000
  });
}

Client.prototype.start = function() {
    if (this.started) {
        return
    }
    this.started = true

    var context = new AudioContext();
    var latency = 0
    var ts = this.ts
    ts.on('change', function (offset) {
      latency = -offset/1000000
    });
    this.socket.on('stream_data', function(stream){
      var perf = performance.now()
      context.decodeAudioData(stream).then(function(decodedData) {
         var source = context.createBufferSource()
         source.buffer = decodedData
         source.connect(context.destination)

         var delayTot = (latency + (performance.now() - perf)/1000).toFixed(3)
         var amortization = Math.exp(-0.1/Math.abs(delayTot)).toFixed(3)
         document.getElementById('clock').innerHTML = delayTot + " * " + amortization + " s"
         if (delayTot < 0) {
            source.start(-delayTot * amortization)
         } else {
            source.start(0, delayTot * amortization)
         }
         latency = Math.max(latency, latency-delayTot)
      })
   })

}
