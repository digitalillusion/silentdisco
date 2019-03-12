function Client(params) {
  this.socket = io(params.server, {
    path: '/silentdisco'
  });
  this.ts = timesync.create({
    server: '/timesync',
    interval: 10000
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

    var bufferTime = 3
    var next = bufferTime
    this.socket.on('stream_data', function(stream){
      var perf = performance.now()

      context.decodeAudioData(stream).then(function(decodedData) {
         var delay = (latency + (performance.now() - perf)/1000).toFixed(3)
         var amortization = Math.min(1, 100/(1 + Math.exp(-10*(delay - 1)))).toFixed(3)
         var delayAmortized = delay * amortization
         document.getElementById('clock').innerHTML = delay + " * " + amortization + " s"

         var source = context.createBufferSource()
         source.buffer = decodedData
         source.connect(context.destination)

         if (delayAmortized < 0) {
           source.start(next - delayAmortized)
         } else {
           source.start(next)
         }
         next = context.currentTime + decodedData.duration + bufferTime - delayAmortized
      })
   })

}
