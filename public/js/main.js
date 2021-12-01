const chat = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-list');
const userList = document.getElementById('users-list');

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const socket = io();

//joins the chat room
socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({room, users}) => {
    //displayRoomName(room);
    displayUsers(users);
})

socket.on('message', data => {
    displayMessage(data);

    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//Message submit handler
chat.addEventListener('submit', (e) => {
    e.preventDefault();

    //Get message text
    let msg = e.target.elements.msg.value;

    msg = msg.trim();

    if(!msg) return false;

    //Emit message to server
    socket.emit('chatMessage', msg);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function displayMessage(data) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
    <div class = "text-wrapper">
        <p class="meta">${data.username} <span>${data.time}</span></p>
        <p class = "text">${data.message}</p>
    </div>
    `;

    document.querySelector('.chat-messages').appendChild(div);
}

//VOICE CHAT//
const userStatus = {
    microphone: false,
    mute: false, 
    online: false,
}

window.onload = (e) => 
{
    voiceChat();
};

function voiceChat() {
    navigator.mediaDevices.getUserMedia({audio: true}).then((stream) => {
        let mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        let audioChunks = [];

        mediaRecorder.addEventListener('dataavailable', (e) => {
            audioChunks.push(e.data);
        });
        
        mediaRecorder.addEventListener('stop', () => {
            let audioBlob = new Blob(audioChunks);

            audioChunks = [];

            let fileReader = new FileReader();
            fileReader.readAsDataURL(audioBlob);
            fileReader.onloadend = () => {
                if(!userStatus.microphone || !userStatus.online) {
                    return;
                }

                var b64string = fileReader.result;
                socket.emit('voice', b64string);
            };

            mediaRecorder.start();

            setTimeout(() => {
                mediaRecorder.stop();
            }, 1000);
        });

        setTimeout(function () {
            mediaRecorder.stop();
        }, 1000);
    });

    socket.on("send", function(data) {
        let audio = new Audio(data);
        audio.play();
    })
}

// function displayRoomName(room) {
//     roomName.innerHTML = `
//     ${room.map(room => `<li>${room.room}</li>`).join('')}
//     `
// }

function displayUsers(users) {
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
}