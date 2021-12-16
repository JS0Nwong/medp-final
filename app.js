//REQUIRED LIBRARIES
const express = require('express')
const app = express();
const server = require('http').Server(app)
const { v4: uuidV4 } = require('uuid')
const io = require('socket.io')(server)

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

  //LISTEN FOR USER JOINING
  socket.on('join-room', (roomId, userId, userName) => {

    //WELCOME MESSAGE
    socket.emit('createMessage', formatMessage(botName, `Welcome ${userName} to the room!`));

    //JOIN ROOM
    socket.join(roomId)

    //SENDS USER-CONNECTED RESPONSE TO FRONT END
    socket.to(roomId).broadcast.emit('user-connected', userId)

    //LISTEN FOR MESSAGE AND FORMATS MESSAGE WITH TIMESTAMP AND USERNAME
    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', formatMessage(userName, message))
    });

    // socket.on('stream', (stream) => {
    //   io.to(roomId).emit('createStream', stream)
    // });

    //LISTEN FOR DISCONNECT
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })
  })

})

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Express started on http://localhost:${PORT}. Server is running on port ${PORT}`);
});