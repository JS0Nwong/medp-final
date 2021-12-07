var Peer = window.SimplePeer;

var initiateBtn = document.getElementById('initiateBtn');
// var stopBtn = document.getElementById('stopBtn');
var initiator = false;

const stunServerConfig = {
  iceServers: [{
    url: 'turn:13.250.13.83:3478?transport=udp',
    username: "YzYNCouZM1mhqhmseWk6",
    credential: "YzYNCouZM1mhqhmseWk6"
  }]
};

initiateBtn.onclick = (e) => {
  initiator = true;
  socket.emit('initiate');
}

// stopBtn.onclick = (e) => {
//   socket.emit('initiate');
// }

socket.on('initiate', () => {
  startStream();
  initiateBtn.style.display = 'none';
  //stopBtn.style.display = 'block';
})

function startStream () {
  if (initiator) {
    // get screen stream
    navigator.mediaDevices.getUserMedia({
      video: {
        mediaSource: "screen",
        width: { max: '1920' },
        height: { max: '1080' },
        frameRate: { max: '10' }
      }
    }).then(gotMedia);
  } else {
    gotMedia(null);
  }
}

function gotMedia (stream) {
  if (initiator) {
    var peer = new Peer({
      initiator,
      stream,
      config: stunServerConfig
    });
  } else {
    var peer = new Peer({
      config: stunServerConfig
    });
  }

  peer.on('signal', function (data) {
    socket.emit('offer', JSON.stringify(data));
  });

  socket.on('offer', (data) => {
    peer.signal(JSON.parse(data));
  })

  peer.on('stream', function (stream) {
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video');
    video.srcObject = stream;
    video.play();
  })
}