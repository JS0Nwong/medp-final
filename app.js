//REQUIRED LIBRARIES
const express = require('express')
const app = express();
const server = require('http').Server(app)
const { v4: uuidV4 } = require('uuid')
const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  }
})

//HELPER FUNCTIONS
const {userJoin, getUser, userLeave, getRoomUsers} = require('./public/js/user')
const formatMessage = require('./public/js/messages')

//INITIALIZE PEER TO PEER CONNECTION
var { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});

const botName = 'AlfredBot';
const socketStatus = {};

var handlebars = require('express-handlebars').create({
  defaultLayout: 'main'
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use('/peerjs', peerServer);
app.use(express.static(__dirname + '/public'));

//GENRATE ROOM ID
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

//PUTS THE USER IN A ROOM WITH A UNIQUE ID
app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

//LISTEN FOR CONNECTION
io.on('connection', (socket) => {

  const socketId = socket.id;
  socketStatus[socketId] = {};

  socket.on('join-room', (roomId, userId, userName) => {

    const user = userJoin(socketId, userName, roomId);

    socket.emit('createMessage', formatMessage(botName, `Welcome ${userName} to the room!`));

    //JOIN ROOM
    socket.join(roomId)

    //socket.emit('message', formatMessage(botName, 'Welcome to the chatroom!'));

    socket.to(roomId).broadcast.emit('user-connected', userId)

    //LISTEN FOR MESSAGE
    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', formatMessage(userName, message))
    });


  })
  // //LISTEN FOR DISCONNECT
  // socket.on('disconnect', () => {
  //   const user = userLeave(socketId);

  //   io.to(user.room).broadcast.emit('createMessage', formatMessage(botName, 'User has left the chat'))
  // })
})

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Express started on http://localhost:${PORT}. Server is running on port ${PORT}`);
});