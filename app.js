const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const bodyParser = require('body-parser')

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const formatMessage = require('./public/js/messages');
const {userJoin, getUser, userLeave, getRoomUsers} = require('./public/js/user')

const botName = 'ChatBot';

let signups = [];
let messages = [];
const socketStatus = {};

// set up handlebars view engine
var handlebars = require('express-handlebars').create({
    defaultLayout:'main'
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

//Runs when the client connects to the server
io.on('connection', socket => {

  const socketId = socket.id;
  socketStatus[socketId] = {};

  socket.on('joinRoom', ({username, room}) => {
    const user = userJoin(socketId, username, room);

    signups.push(user);

    socket.join(user.room);

    socket.emit('message', formatMessage(botName, 'Welcome to the chatroom!'));

    socket.broadcast
      .to(user.room)
      .emit('message', formatMessage(botName, `${user.username} has joined the chatroom!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getRoomUsers(user.room)
    });

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //Runs when the client disconnects from the chat
  socket.on('disconnect', () => {
    const user = userLeave(socketId);

    if(user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chatroom.`));

      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }

    delete socketStatus[socketId];
  });

  //Listens for the client to send a message
  socket.on('chatMessage', message => {
    const user = getUser(socketId);
    io.to(user.room).emit('message', formatMessage(user.username, message));
  });

  socket.on('voice', voice => {
    var voiceData = voice.split(';');
    voiceData[0] = "data:audio/ogg";
    voiceData = voiceData[0] + voiceData[1];
    
    for(const id in socketStatus)
    {
      if(id != socketId && !socketStatus[id].muted && socketStatus[id].online)
      {
        socket.broadcast.to(id).emit('send', voiceData);
      }
    }
  });

})

console.log(messages);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Express started on http://localhost:${PORT}. Server is running on port ${PORT}`);
});

// middleware to add list data to context
app.use(function(req, res, next){
	if(!res.locals.partials) res.locals.partials = {};
  // 	res.locals.partials.listOfWorks = listOfWorks;
 	next();
});

// bodyParser allows us to parse form data as JSON
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/home', function(req, res) {
  res.render('home');
});

app.get('/about', function(req,res){
  res.render('about');
});

app.get('/form', function(req, res){
  res.render('form');
})


app.post('/form-signup', function(req, res) {
})

app.get('/signups', function(req,res) {
  res.render('signups', {
    signups: signups
  })
})

app.get('/thank-you', function(req, res) {
  res.render('thank-you')
})

app.get('/messages', function(req,res) {
  res.render('messages')
})

app.get('/data/messages', function(req, res) {
  res.json(messages)
})


app.post('/message', function(req, res) {
})

app.get('/edit-messages', function(req, res) {
  console.log('messages: ', messages)
  res.render('edit-messages')
})

app.put('/message', function(req, res) {
  let messageToChange = messages.filter(message => {
    // have to parseInt because the put/post request always sends it in as a string
    return message.messageId == parseInt(req.body.messageId)
  })[0]
})

app.delete('/message', function(req, res) {
 let messageToDelete = messages.filter(message => {
    return message.messageId == parseInt(req.body.messageId)
  })[0]

})
// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

// app.listen(app.get('port'), function(){
//   console.log( 'Express started on http://localhost:' +
//     app.get('port') + '; press Ctrl-C to terminate.' );
// });
