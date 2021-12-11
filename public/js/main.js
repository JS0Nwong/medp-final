const socket = io("/")  
const videoGrid = document.getElementById('video-grid');
const video = document.createElement('video');

video.muted = true;

const user = prompt("Enter your name");

const peer = new Peer(undefined,{
    path: "/peerjs",
    host: "/",
    port: "3000",
})

//GETS DESKTOP SCREEN
const startShare = document.getElementById('screen-share');

startShare.addEventListener('click', () => {
    screenShare();
})

async function screenShare() {
    let screenShare;
    navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false
    }).then(stream => {
        screenShare = stream;
        addVideoStream(video, stream);
    
        peer.on("call", (call) => {
            call.answer(stream);
            const myVideo = document.createElement('video');
            call.on('stream', userVideoStream => {
                addVideoStream(myVideo, userVideoStream);
            });
        });
    
        socket.on("user-connected", (userId) => {
            connectUser(userId, stream);
        });
    
    }).catch(err => console.log(err));
}

function stopShare(e) {
    screenShare.stop();
}

//GETS CAMERA VIDEO AND MICROPHONE AUDIO 

const getCamera = document.getElementById('camera')

getCamera.addEventListener('click', () => {
    getVideo();
})

async function getVideo() {
    let myVideoStream;
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    }).then(stream => {
        myVideoStream = stream;
        addVideoStream(video, stream);

        peer.on("call", (call) => {
            call.answer(stream);
            const myVideo = document.createElement('video');
            call.on('stream', userVideoStream => {
                addVideoStream(myVideo, userVideoStream);
            });
        });

        socket.on("user-connected", (userId) => {
            connectUser(userId, stream);
        });

    }).catch(err => console.log(err));
}

const connectUser = (userId, stream) => {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });
};

peer.on("open", id => {
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
    }
});

//DISPLAYS MESSAGE IN THE CHAT BOX
socket.on("createMessage", (message, userName) => {
    const div = document.createElement('div');
    div.classList.add('messages-wrapper');
    div.innerHTML = `
    <div class="text-message">
        <b>
            <i class="far fa-user-circle"></i>
            <span> ${userName === user ? "Me" : userName} </span> 
        </b>
        <span>${message}</span>
    </div>`;

    displayMessage.appendChild(div);
});

//STOP VIDEO AND AUDIO
startShare.addEventListener('click', () => {
    
})

