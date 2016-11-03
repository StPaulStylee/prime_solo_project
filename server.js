var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var login = require('./routes/login');
var register = require('./routes/register');
var account = require('./routes/account');
var authorization = require('./authorization/setup');
var passport = require('passport');
var session = require('express-session');

authorization.setup();

const sessionConfig = {
  secret: 'super secret key goes here', //This should be read from the environment. WHAT?
  key: 'user',
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 1000,
    secure: false
  }
};


app.use(session(sessionConfig));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use('/login', login);
app.use('/register', register);
app.use('/account', account);

app.get('/*', function(req, res){
  res.sendFile(path.join(__dirname, 'public/views/index.html'));
});


// everything beyond this point MUST be authenticated

app.use(ensureAuthenticated);

app.get('supersecret', function(req, res){
  res.send('This is a secret page. Is this like... where I will send the admin?')
});

// app.get('/*', function(req, res){
//   // Do I want to create a different file branch for admin and put it here?
//   res.sendFile(path.join(__dirname, 'public/views/index.html'));
// });

function ensureAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(401);
  }
}

var port = process.env.PORT || 3000;
var server = app. listen(port, function () {
  console.log('Listening on port ', server.address().port);
});
var io = require('socket.io')(server);

io.on('connection', function(socket){
  console.log('On connection to server: ', 'A user connected on socket: ', socket);
  socket.on('disconnect', function (){
    console.log('A user has disconnected');
  });
  socket.emit('greeting', { greeting: 'Your angular socket is working!'});
  socket.on('client reply', function (data){
  console.log('log from server', data);
  })
  // socket.on('chat message', function(msg){
  //   console.log('Message to emit: ', msg);
  //   io.emit('chat message', msg);
  // });
});
