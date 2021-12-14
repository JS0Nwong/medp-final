const socket = io("/")  
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');

myVideo.muted = true;

const user = prompt("Enter your name");

const peer = new Peer();

//GETS DESKTOP SCREEN
let screenShare;
async function startScreenShare()
{
    navigator.mediaDevices.getDisplayMedia({
        video: false,
        audio: false
    }).then(stream => {
        screenShare = stream;
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("user-connected", (userId) => {
            connectUser(userId, stream);
        });        
    })
}

//GETS CAMERA VIDEO AND MICROPHONE AUDIO 
let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100,
    }
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {

        console.log(call)

        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', (userVideoStream) => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on("user-connected", (userId) => {
        connectUser(userId, stream);
    });
});


const connectUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });
};

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
        videoGrid.append(video);
    });
}

//CHAT FUNCTIONALITY
let message = document.getElementById('chat-message');
let displayMessage = document.getElementById('display-message');

//LISTENS FOR SUBMIT EVENT 
message.addEventListener('keydown', (e) => {

    if(e.key === "Enter" && message.value.length !== 0){
        socket.emit('message', message.value);
        message.value = '';
        message.focus();
    }
});

//DISPLAYS MESSAGE IN THE CHAT BOX
socket.on("createMessage", (data) => {
    displayMessages(data);
    displayMessage.scrollTop = displayMessage.scrollHeight;
});

function displayMessages(data)
{
    const div = document.createElement('div');
    div.classList.add('messages-wrapper');
    div.innerHTML = `
    <div class="text-message">
        <b>
            <i class="far fa-user-circle"></i>
            <span> ${data.username === user ? `Me (${data.username})` : data.username} <span>${data.time}</span></span> 
        </b>
        <span>${data.message}</span>
    </div>`;

    displayMessage.appendChild(div);
}

//INVITE BUTTON
const invite = document.getElementById('invite');

invite.addEventListener('click', () => {
    prompt("Send this link to the people you want to chat with: ", window.location.href);
});

//STOP VIDEO AND MUTE BUTTON
const stopVideo = document.getElementById('stop-video');
const mute = document.getElementById('mute-mic');
const startShare = document.getElementById('screen-share');

stopVideo.addEventListener('click', () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        stopVideo.innerHTML = `<i class="fas fa-video"></i>`;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        stopVideo.innerHTML = `<i class="fas fa-video-slash"></i>`;
    }
});

mute.addEventListener('click', () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        mute.innerHTML = `<i class="fas fa-microphone-alt"></i>`;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        mute.innerHTML = `<i class="fas fa-microphone-alt-slash"></i>`;
    }
});

startShare.addEventListener('click', () => {
    let enabled = false
    if(!enabled) {
        startScreenShare();
        enabled = true;
        startShare.innerHTML = `<i class="fas fa-eye-slash"></i>`;
    } else {
        let tracks = screenShare.getVideoTracks();
        tracks.forEach(track => {
            track.stop();
        });
        screenShare.srcObject = null;
        enabled = false;
        startShare.innerHTML = `<i class="fas fa-desktop"></i>`;
    }
});

