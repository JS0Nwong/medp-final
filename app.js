//REQUIRED LIBRARIES
const express = require('express')
const app = express();
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

//helper functions
const formatMessage = require('./public/js/messages');
//const {userJoin, getUser, userLeave, getRoomUsers} = require('./public/js/user')

//INITIALIZE PEER TO PEER CONNECTION
var {ExpressPeerServer} = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

const botName = 'Alfred';

var handlebars = require('express-handlebars').create({
  defaultLayout:'main'
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId, userName) => {

    socket.join(roomId)

    socket.emit('message', formatMessage(botName, 'Welcome to the chatroom!'));

    socket.to(roomId).broadcast.emit('user-connected', userId)

    socket.on('message', (message) => {
      io.to(roomId).emit('createMessage', message, userName)
    });
    

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
    })

  })
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Express started on http://localhost:${PORT}. Server is running on port ${PORT}`);
});