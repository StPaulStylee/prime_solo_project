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
var table = new Table('Fish Fry', 5, 10);


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
    var player =findPlayer(socket, table);
    var message = { user: player.username, msg: msg.msg}
    io.emit('chatMessage', {username: player.username, msg: msg.msg})

    //io.emit('chatMessage', {player.username: msg});
  });

  socket.on('table', function(){
    io.emit('table', table);
  });

  socket.on('ready', function(){
    table.readyCount++;
    console.log(table.readyCount);
    if(table.readyCount == 3){
      table.deck.makeDeck(1);
      table.deck.shuffle(3);
      for(var i = 0; i < table.playerCount; i++) {
        table.players[i].hand.push(table.deck.deal());
      }
      for(var i = 0; i < table.playerCount; i++) {
        table.players[i].hand.push(table.deck.deal());
    }

    if (table.dealerButton < table.players.length && table.dealerButton == 0) {
      table.players[table.dealerButton].dealer = true;
      table.potSize += table.smallBlind + table.bigBlind;
      table.players[table.dealerButton + 1].chipStack -= table.smallBlind;
      table.players[table.dealerButton + 2].chipStack -= table.bigBlind;
      table.dealerButton++;

    } else if (table.dealerButton < table.players.length && table.dealerButton == 1) {
      table.players[table.dealerButton].dealer = true;
      table.dealterButton++;
    } else if (table.dealerButton < table.players.length && table.dealerButton == 2) {
      table.players[table.dealerButton].dealer = true;
      table.dealterButton++;
    }
    console.log('Table on Ready: ', table);
    io.emit('ready', table);
    }
  });

  socket.on('preFlopBet', function(bet){
    console.log('From preFlopBet event', bet);
//    io.emit('preFlopBet', data);

    var player = findPlayer(socket, table);
    table.potSize += bet.bet;
    table.betSize = bet.bet;
    player.chipStack -= bet.bet;

    console.log('player', player);
    console.log('table', table);
    // table.postSize += data.betSize
    // table.players + ['data'].username = data
    io.emit('preFlopBet', table);
  });

// Event that begins the next hand
  socket.on('nextHand', function(){
    table.handsPlayed++;
    table.potSize = 0;
    table.betSize = 0;
    table.flop = [];
    table.turn = [];
    table.river = [];
    table.discard = [];

    for(var i = 0; i < table.players.length; i++) {
      table.players[i].hand = [];
    }

    if (table.dealerButton < table.players.length && table.dealerButton == 0) {
      table.players[table.players.length - 1].dealer = false;
      table.players[table.dealerButton].dealer = true;
      table.potSize += table.smallBlind + table.bigBlind;
      table.players[table.dealerButton + 1].chipStack -= table.smallBlind;
      table.players[table.dealerButton + 2].chipStack -= table.bigBlind;
      table.dealerButton++;

    } else if (table.dealerButton < table.players.length && table.dealerButton == 1) {
      table.players[table.dealerButton - 1].dealer = false;
      table.players[table.dealerButton].dealer = true;
      table.potSize += table.smallBlind + table.bigBlind;
      table.players[table.dealerButton + 1].chipStack -= table.smallBlind;
      table.players[0].chipStack -= table.bigBlind;
      table.dealerButton++;

    } else if (table.dealerButton < table.players.length && table.dealerButton == 2) {
      table.players[table.dealerButton - 1].dealer = false;
      table.players[table.dealerButton].dealer = true;
      table.potSize += table.smallBlind + table.bigBlind;
      table.players[0].chipStack -= table.smallBlind;
      table.players[1].chipStack -= table.bigBlind;
      table.dealerButton++;
    } else if (table.dealerButton == table.players.length) {
      table.players[table.players.length - 1].dealer = false;
      table.players[0].dealer = true;
      table.potSize += table.smallBlind + table.bigBlind;
      table.players[1].chipStack -= table.smallBlind;
      table.players[2].chipStack -= table.bigBlind;
      table.dealerButton = 1;
    }
    // After the deal button is moved, shuffle the deck and deal the cards
      table.deck.makeDeck(1);
      table.deck.shuffle(3);
      for(var i = 0; i < table.playerCount; i++) {
        table.players[i].hand.push(table.deck.deal());
      }
      for(var i = 0; i < table.playerCount; i++) {
        table.players[i].hand.push(table.deck.deal());
      }
    // Then send the updated table object back to the client
      io.emit('nextHand', table);
      console.log('Table for next hand', table);
      console.log('Deck length on newHand:', table.deck.cards.length);
    });

  socket.on('flopRequest', function(){
    console.log('Recieved flopRequest');
    table.discard.push(table.deck.deal());
    table.flop.push(table.deck.deal());
    table.flop.push(table.deck.deal());
    table.flop.push(table.deck.deal());
    console.log('Flop Dealt:', table.flop);
    console.log('Burn Cards:', table.discard);
    console.log('Cards Remaining in Deck: ', table.deck.cards.length);
    io.emit('flopRequest', table);
  });

  socket.on('turnRequest', function(){
    console.log('Received turnRequest');
    table.discard.push(table.deck.deal());
    table.turn.push(table.deck.deal());
    console.log('Turn Dealt: ', table.turn);
    console.log('Burn Cards: ', table.discard);
    console.log('Cards Remaining in Deck: ', table.deck.cards.length);
    io.emit('turnRequest', table)
  });

  socket.on('riverRequest', function(){
    console.log('Received riverRequest');
    table.discard.push(table.deck.deal());
    table.river.push(table.deck.deal());
    console.log('river Dealt: ', table.river);
    console.log('Burn Cards: ', table.discard);
    console.log('Cards Remaining in Deck: ', table.deck.cards.length);
    io.emit('riverRequest', table)
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
}); // End of socket.io

function findPlayer(socket, table) {
  return table.players.filter(function(player){
    return player.id === socket.id;
  })[0];
}
