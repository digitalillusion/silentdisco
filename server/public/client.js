function Client(params) {
  this.socket = io(params.server, {
    path: '/silentdisco'
  });
}

Client.prototype.start = function() {
    if (this.started) {
        return
    }
    this.started = true

    ServerDate.synchronizationIntervalDelay = 10000
    var context = new AudioContext();
    var bestPrecision = 1000
    this.socket.on('stream_data', function(stream){
      var perf = performance.now()
      var latency = 0
      if (ServerDate.getPrecision() < bestPrecision) {
        bestPrecision = ServerDate.getPrecision()
        latency = (ServerDate.now() - stream.time)/1000
        document.getElementById('clock').innerHTML = latency + " ~" + bestPrecision + " ms"
      }

      context.decodeAudioData(stream.data).then(function(decodedData) {
         var source = context.createBufferSource()
         source.buffer = decodedData
         source.connect(context.destination)

         var delayTot = latency + (performance.now() - perf)/1000
         if (delayTot < 0) {
            source.start(-delayTot)
         } else {
            source.start(0, delayTot)
         }

         console.log('Starting delayed by %f s.', delayTot);
      })
   })

}
