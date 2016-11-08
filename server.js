// Dependencies
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

// Modules
var Player = require('./modules/player');
var Table = require('./modules/table');
var Deck = require('./modules/deck');

// Global Setup Variables
var table = new Table('Fish Fry');

// var connections = [];
// var playersOnline = [];

io.on('connection', function(socket){
  //connections.push(socket);
  //console.log('Connected: %s connected', connections.length);

  socket.on('playerLoggedIn', function(data){
    console.log('Data from login:', data);
    var player = new Player(socket.id, data.username);
    table.playerCount++
    //playersOnline.push(player);
    table.players.push(player);
    table.seatAssign();
    console.log('Table from Login: ', table);
    // table.handAssign();
    // table.deck.makeDeck(1)
    // console.log('Player created:', player);
    // console.log(player.username + ' just signed in and has been assigned to socket ID:' + socket.id);
    // console.log('Players at the table:', table.players);
    //console.log(table);
    //console.log('Players Online: ', playersOnline);
  });

  socket.on('chatMessage', function(msg){
    io.emit('chatMessage', msg);
  });

  socket.on('table', function(){
    io.emit('table', table);
  });

  socket.on('ready', function(){
    table.readyCount++;
    console.log(table.readyCount);
    if(table.readyCount == 2){
      table.deck.makeDeck(1);
      table.deck.shuffle(3);
      for(var i = 0; i < table.playerCount; i++) {
        table.players[i].hand.push(table.deck.deal());
      }
    for(var i = 0; i < table.playerCount; i++) {
      table.players[i].hand.push(table.deck.deal());
    }
    io.emit('ready', table);
  }
    //console.log(table.deck.cards);
  });

  // socket.on('start', function(){
  //   console.log('Recieved Start!')
  //   for(var i = 0; i < table.playerCount; i++) {
  //     table.hands['Seat ' + (i + 1)].push(table.deck.deal());
  //   }
  //   for(var i = 0; i < table.playerCount; i++) {
  //     table.hands['Seat ' + (i + 1)].push(table.deck.deal());
  //   }
  //   io.emit('table', table);
  //   console.log(table);
  // });


  // disconnect
  socket.on('disconnect', function (){
    //connections.splice(connections.indexOf(socket), 1);
    //console.log(playerOnline.username + ' has disconnected.');
    console.log('A user has disconnected.');
  });
});
