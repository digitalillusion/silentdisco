function Client(params) {
  this.socket = io(params.server, {
    path: '/silentdisco'
  });
  this.ts = timesync.create({
    server: '/timesync',
    interval: 60000 * 15
  });
}

Client.prototype.start = function() {
    if (this.started) {
        return
    }
    this.started = true

    var context = new AudioContext();
    var latency = 0, bufferTime = 3, next = 0, delayAmortized = 0
    var ts = this.ts
    ts.on('change', function (offset) {
      latency = -offset/1000000
      delayAmortized = 0
    });
    this.socket.on('stream_data', function(stream){
      var perf = performance.now()

      context.decodeAudioData(stream).then(function(decodedData) {
         var delay = latency + (performance.now() - perf)/1000
         var amortization = Math.min(1, 15/(1 + Math.exp(-5*(delay - 1.5))))
         delayAmortized = Math.max(delay * amortization, delayAmortized)
         document.getElementById('clock').innerHTML = delay.toFixed(3) + " * " + amortization.toFixed(3) + " s"

         var source = context.createBufferSource()
         source.buffer = decodedData
         source.connect(context.destination)

         source.start(Math.max(0, next - delayAmortized))
         next = next - delayAmortized + decodedData.duration
      })
   })

}
