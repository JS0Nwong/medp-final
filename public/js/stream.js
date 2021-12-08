const videoGrid = document.getElementById('video');


var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});

let videoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
}).then((stream) => {
    videoStream = stream;
    addVideoStream(videoStream, stream);

    const video = document.createElement('video');
    peer.on("stream", (userStream) => {
        addVideoStream(video, userStream);
    })
})

const addVideoStream = (videoStream, stream) => {
    videoStream.srcObject = stream;
    videoStream.addEventListener('loadedmetadata', () => {
        videoStream.play();
        videoGrid.appendChild(videoStream);
    });
};