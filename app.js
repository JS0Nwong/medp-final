const express = require('express');
const bodyParser = require('body-parser')
const app = express();
let Sent = require('sentiment')
let sentiment = new Sent()

let signups = []

// set up handlebars view engine
var handlebars = require('express-handlebars').create({
    defaultLayout:'main'
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

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

let messages = [{messageId: 0, message: "hey what's up?", name: "Brent"}]
function sentimentToEmoji(message) {
  message.sentiment = sentiment.analyze(message.message)
  if (message.sentiment.score > 0) {
    message.emoji = "😊"
  } else if (message.sentiment.score == 0) {
    message.emoji = "😐"
  } else {
    message.emoji = "☹️"
  }

}

sentimentToEmoji(messages[0])

console.log('message: ', messages[0])
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

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});
