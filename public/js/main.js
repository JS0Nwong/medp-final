const socket = io("/")  
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');

myVideo.muted = true;

const peers = {};

const user = prompt("Enter your name");

//CREATE A NEW PEER OBJECT
const peer = new Peer()

socket.on("user-connected", (userId) => {
    console.log('User Connected: ', userId);

    console.log(peers);
})

//GETS DESKTOP SCREEN
let screenShare;
async function startScreenShare()
{
    //GETS THE SCREEN
    navigator.mediaDevices.getDisplayMedia({
        video: false,
        audio: false
    }).then(stream => {

        //GETS STREAM DATA
        screenShare = stream;
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream);
            });

        });

        //CONNECTS USER TO THE ROOM
        socket.on("user-connected", (userId) => {
            //SENDS THE CURRENT VIDEO STREAM TO THE NEW USER THAT CONNECTED
            connectUser(userId, stream);
        });        
    })
}

//GETS CAMERA VIDEO AND MICROPHONE AUDIO 
let myVideoStream;
//GETS USER MEDIA AND SEND TO PEER
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

    //LISTENS TO WHEN SOMEONE TRIES TO CALL/JOIN THE ROOM
    peer.on("call", (call) => {

        //ANSWERS THE CALL AND SENDS THE USER VIDEO STREAM
        call.answer(stream);
        const video = document.createElement('video');
        //LISTENS FOR THE NEW USER VIDEO STREAM AND APPENDS TO THE VIDEO GRID
        call.on('stream', (userVideoStream) => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on("user-connected", (userId) => {
        connectUser(userId, stream);
    });
});

function connectUser(userId, stream) {
    //CALL USER WITH THE ID PASSED IN AND SEND VIDEO STREAM
    const call = peer.call(userId, stream);
    const video = document.createElement('video');

    //TAKES IN THE NEW USER VIDEO STREAM AND APPENDS TO THE VIDEO GRID
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream);
    });

    //REMOVES THE USER VIDEO STREAM FROM THE VIDEO GRID WHEN THE USER DISCONNECTS
    call.on('close', () => {
        video.remove();
    })

    //MAKES EVERY USER ID DIRECTLY CONNECTED A CALL
    peers[userId] = call;
};

//LISTENS FOR USER DISCONNECT
socket.on('user-disconnected', userId => {

    console.log('User disconnected: ', userId);
    //CLOSES THE CONNECTION IF THE USER DISCONNECTS
    if (peers[userId]) peers[userId].close();
})

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user);
});

//ADDS THE VIDEO STREAM TO THE VIDEO GRID
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    videoGrid.append(video);
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

//STOP VIDEO, MUTE BUTTON, SHARE SCREEN BUTTON
const stopVideo = document.getElementById('stop-video');
const mute = document.getElementById('mute-mic');
const startShare = document.getElementById('screen-share');

stopVideo.addEventListener('click', () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if(enabled)
    {
        myVideoStream.getVideoTracks()[0].enabled = false;
        stopVideo.innerHTML = '<i class="fas fa-video"></i>';
    }
    else
    {
        myVideoStream.getVideoTracks()[0].enabled = true;
        stopVideo.innerHTML = '<i class="fas fa-video-slash"></i>';
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
        tracks.forEach(track => track.stop());
        screenShare.srcObject = null;
        enabled = false;
        startShare.innerHTML = `<i class="fas fa-desktop"></i>`;
    }
});

