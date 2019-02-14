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
    this.socket.on('stream_data', function(stream){
      var perf = performance.now()
      var latency = (ServerDate.now() - stream.time)/1000
      document.getElementById('clock').innerHTML = latency + " " + ServerDate.getPrecision()

      context.decodeAudioData(stream.data).then(function(decodedData) {
         var source = context.createBufferSource()
         source.buffer = decodedData
         source.connect(context.destination)

         var delayTot = Math.max(0, -latency - (performance.now() - perf)/1000);
         source.start(context.currentTime + delayTot);
         console.log('Starting delayed by %f s.', delayTot);
      })
   })

}
