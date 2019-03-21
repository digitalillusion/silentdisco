function Client(params) {
  this.socket = io(params.server, {
    path: '/silentdisco'
  });
  this.ts = timesync.create({
    server: '/timesync',
    interval: 60000 * 30
  });
}

Client.prototype.start = function() {
    if (this.started) {
        return
    }
    this.started = true

    var context = new AudioContext();
    var latency = 0, bufferTime = 2, next = 0
    var ts = this.ts
    ts.on('change', function (offset) {
      latency = -offset/1000000
    });

    this.socket.on('stream_data', function(stream){
      var perf = performance.now()

      context.decodeAudioData(stream).then(function(decodedData) {
         var st = new SoundTouch()
         var filter = new SimpleFilter(new WebAudioBufferSource(decodedData), st)
         var processBuffer = new Float32Array(decodedData.length * 2)

         var delayTot = (latency + (performance.now() - perf)/1000)
         st.tempo = 1 - delayTot/decodedData.duration
         document.getElementById('clock').innerHTML = delayTot.toFixed(3) + " / " + st.tempo.toFixed(3)  + " stretch"
         var stretchedLength = filter.extract(processBuffer, decodedData.length)

         buffer = context.createBuffer(2, decodedData.length, context.sampleRate)
         var left = buffer.getChannelData(0)
         var right = buffer.getChannelData(1)
         for (var i = 0; stretchedLength > i; i++) {
              left[i] = processBuffer[2 * i]
              right[i] = processBuffer[2 * i + 1]
         }

         var source = context.createBufferSource()
         source.buffer = buffer
         source.connect(context.destination)

         source.start(Math.max(0, next))
         next = context.currentTime + buffer.duration + bufferTime
      })
   })

}
