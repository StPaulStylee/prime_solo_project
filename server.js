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
//var Gameplay = require('./modules/gameplay')

// Global Setup Variables
var table = new Table('Fish Fry', 5, 10);

// var playersOnline = [];

io.on('connection', function(socket){

  socket.on('playerLoggedIn', function(data){
    console.log('Data from login:', data);
    var player = new Player(socket.id, data.username);
    table.playerCount++
    //playersOnline.push(player);
    table.players.push(player);
    table.seatAssign();
    console.log('Table from Login: ', table);
  });

  socket.on('chatMessage', function(msg){
    var player = findPlayer(socket, table);
    var message = { user: player.username, msg: msg.msg}
    io.emit('chatMessage', {username: player.username, msg: msg.msg})

    //io.emit('chatMessage', {player.username: msg});
  });

  socket.on('table', function(){
    io.emit('table', table);
  });

  /*----------------------------------------------------------------------------
  Start of Game
  ---------------------------------------------------------------------------*/

  socket.on('ready', function(){
    table.readyCount++;
    console.log(table.readyCount);
    if(table.readyCount == 3){
      ready();
      setDealerStart();
      setTurnToActStart();
    }
    console.log('Dealer button', table.dealerButton);
    console.log('Table on Ready: ', table);
    io.emit('ready', table);
  });

  /*----------------------------------------------------------------------------
  Preflop
  ---------------------------------------------------------------------------*/
  socket.on('preFlopBet', function(bet){
    console.log('From pre flop BET event', bet);
    var player = findPlayer(socket, table);
    console.log('findPlayer() from pre flop BET event: ', player)
    if (bet.bet > table.highestBet) {
      table.highestBet = bet.bet
    }
    table.potSize += bet.bet;
    table.betSize = bet.bet;
    player.chipStack -= bet.bet;
    player.moneyOnStreet += bet.bet
    player.handBet = true;
    console.log(player);

    setTurnToAct();
    io.emit('preFlopBet', table);
  });

  socket.on('preFlopCheck', function(){
    var player = findPlayer(socket, table);
    // if (player.moneyOnStreet < table.bigBlind) {
    //   io.emit('preFlopCheckError');
    // }
    player.handCheck = true;
    // for (var i = 0; i < table.players.length; i++) {
    //   if (table.players[i].handActive == true) {
    //     if (table.players[i].handCheck == true) {
    //
    //     }
    //     else if (table.players[i].handBet == true) {
    //
    //     }
    //   }
    // }
    console.log('findPlayer() from pre flop CHECK event', player);
    setTurnToAct();
    io.emit('preFlopCheck', table);
  });

  socket.on('preFoldFold', function(){
    var player = findPlayer(socket, table);
    player.handActive = false;
    setTurnToAct();
  });

  /*----------------------------------------------------------------------------
  Flop
  ---------------------------------------------------------------------------*/

  socket.on('flopRequest', function(){
    table.betSize = 0;
    table.highestBet = 0
    console.log('Recieved flopRequest');
    dealFlop();
    console.log('Flop Dealt:', table.flop);
    console.log('Burn Cards:', table.discard);
    console.log('Cards Remaining in Deck: ', table.deck.cards.length);
    io.emit('flopRequest', table);

  });


    /*----------------------------------------------------------------------------
    Turn
    ---------------------------------------------------------------------------*/

  socket.on('turnRequest', function(){

    console.log('Received turnRequest');
    dealTurn();
    console.log('Turn Dealt: ', table.turn);
    console.log('Burn Cards: ', table.discard);
    console.log('Cards Remaining in Deck: ', table.deck.cards.length);
    io.emit('turnRequest', table)

  });

  /*----------------------------------------------------------------------------
  River
  ---------------------------------------------------------------------------*/

  socket.on('riverRequest', function(){

    console.log('Received riverRequest');
    dealRiver();
    console.log('river Dealt: ', table.river);
    console.log('Burn Cards: ', table.discard);
    console.log('Cards Remaining in Deck: ', table.deck.cards.length);
    io.emit('riverRequest', table)

  });

  /*----------------------------------------------------------------------------
  Showdown
  ---------------------------------------------------------------------------*/

  /*----------------------------------------------------------------------------
  Next Hand Request
  ---------------------------------------------------------------------------*/

  // Event that begins the next hand
    socket.on('nextHand', function(){
      table.handsPlayed++;
      table.potSize = 0;
      table.betSize = 0;
      table.highestBet = table.bigBlind;
      table.flop = [];
      table.turn = [];
      table.river = [];
      table.discard = [];

      clearHands();
      setDealer();
      // After the deal button is moved, shuffle the deck and deal the cards
      dealHands();
      // Then send the updated table object back to the client
        io.emit('nextHand', table);
        console.log('Table for next hand', table);
        console.log('Deck length on newHand:', table.deck.cards.length);
      });

  // disconnect
  socket.on('disconnect', function (){
    console.log('A user has disconnected.');
  });
}); // End of socket.io













function findPlayer(socket, table) {
  return table.players.filter(function(player){
    return player.id === socket.id;
  })[0];
}

var ready = function() {
    table.deck.makeDeck(1);
    table.deck.shuffle(3);
    for(var i = 0; i < table.playerCount; i++) {
      table.players[i].hand.push(table.deck.deal());
    }
    for(var i = 0; i < table.playerCount; i++) {
      table.players[i].hand.push(table.deck.deal());
    }
};

var setDealerStart = function() {
  if (table.dealerButton < table.players.length && table.dealerButton == 0) {
    table.players[table.dealerButton].dealer = true;
    table.potSize += table.smallBlind + table.bigBlind;
    table.players[table.dealerButton + 1].chipStack -= table.smallBlind;
    table.players[table.dealerButton + 1].moneyOnStreet = table.smallBlind;
    table.players[table.dealerButton + 1].smallBlind = true;
    table.players[table.dealerButton + 2].chipStack -= table.bigBlind;
    table.players[table.dealerButton + 2].moneyOnStreet = table.bigBlind;
    table.players[table.dealerButton + 2].bigBlind = true;
    table.dealerButton++;
  //
} //else if (table.dealerButton < table.players.length && table.dealerButton == 1) {
  //   table.players[table.dealerButton].dealer = true;
  //   table.dealterButton++;
  //
  // } else if (table.dealerButton < table.players.length && table.dealerButton == 2) {
  //   table.players[table.dealerButton].dealer = true;
  //   table.dealterButton++;
  // }
};

var setTurnToActStart = function() {
  table.players[table.seatToAct].turnToAct = true;
  table.seatToAct++;
};

var setTurnToAct = function() {
  
  if (table.seatToAct < table.players.length && table.seatToAct == 0) {
    table.players[table.players.length - 1].turnToAct = false;
    table.players[table.seatToAct].turnToAct = true;
    table.seatToAct++;

  } else if (table.seatToAct < table.players.length && table.seatToAct == 1) {
    table.players[table.seatToAct - 1].turnToAct = false;
    table.players[table.seatToAct].turnToAct = true;
    table.seatToAct++;

  } else if (table.seatToAct < table.players.length && table.seatToAct == 2) {
    table.players[table.seatToAct - 1].turnToAct = false;
    table.players[table.seatToAct].turnToAct = true;
    table.seatToAct++;

  } else if (table.seatToAct == table.players.length) {
    table.players[table.players.length - 1].turnToAct = false;
    table.players[0].turnToAct = true;
    table.seatToAct = 1;
  }
};

var setDealer = function() {
  for(var i = 0; i < table.players.length; i++) {
    table.players[i].turnToAct = false;
  }
    if (table.dealerButton < table.players.length && table.dealerButton == 0) {
      table.players[table.dealerButton].turnToAct = true;
      table.players[2].turnToAct = false;
      table.players[table.players.length - 1].dealer = false;
      table.players[table.dealerButton].dealer = true;
      table.potSize += table.smallBlind + table.bigBlind;
      table.players[table.dealerButton + 1].chipStack -= table.smallBlind;
      table.players[table.dealerButton + 1].smallBlind = true;
      table.players[table.dealerButton + 2].chipStack -= table.bigBlind;
      table.players[table.dealerButton + 2].bigBlind = true;
      table.dealerButton++;
      table.seatToAct = table.dealerButton;

    } else if (table.dealerButton < table.players.length && table.dealerButton == 1) {
      table.seatToAct = table.dealerButton;
      table.players[table.dealerButton].turnToAct = true;
      table.players[table.dealerButton - 1].turnToAct = false;
      table.players[table.dealerButton - 1].dealer = false;
      table.players[table.dealerButton].dealer = true;
      table.potSize += table.smallBlind + table.bigBlind;
      table.players[table.dealerButton + 1].chipStack -= table.smallBlind;
      table.players[table.dealerButton + 1].smallBlind = true;
      table.players[table.dealerButton].smallBlind = false;
      table.players[0].chipStack -= table.bigBlind;
      table.players[0].bigBlind = true;
      table.players[2].bigBlind = false;
      table.dealerButton++;
      table.seatToAct = table.dealerButton;

    } else if (table.dealerButton < table.players.length && table.dealerButton == 2) {
      table.seatToAct = table.dealerButton;
      table.players[table.dealerButton].turnToAct = true;
      table.players[table.dealerButton - 1].turnToAct = false;
      table.players[table.dealerButton - 1].dealer = false;
      table.players[table.dealerButton].dealer = true;
      table.potSize += table.smallBlind + table.bigBlind;
      table.players[0].chipStack -= table.smallBlind;
      table.players[0].smallBlind = true;
      table.players[table.dealerButton].smallBlind = false;
      table.players[1].chipStack -= table.bigBlind;
      table.players[1].bigBlind = true;
      table.players[0].bigBlind = false;
      table.dealerButton++;
      table.seatToAct = table.dealerButton;

    } else if (table.dealerButton == table.players.length) {
      table.players[table.players.length - 1].dealer = false;
      table.players[0].dealer = true;
      table.potSize += table.smallBlind + table.bigBlind;
      table.players[1].chipStack -= table.smallBlind;
      table.players[1].smallBlind = true;
      table.players[0].smallBlind = false;
      table.players[2].chipStack -= table.bigBlind;
      table.players[2].bigBlind = true;
      table.players[1].bigBlind = false;
      table.dealerButton = 1;
      table.seatToAct = table.dealerButton;
      table.players[0].turnToAct = true;
      table.players[2].turnToAct = false;

    }
  };

  var dealHands = function() {
    table.deck.makeDeck(1);
    table.deck.shuffle(3);
    for(var i = 0; i < table.playerCount; i++) {
      table.players[i].hand.push(table.deck.deal());
    }
    for(var i = 0; i < table.playerCount; i++) {
      table.players[i].hand.push(table.deck.deal());
    }
  };

  var clearHands = function() {
    for(var i = 0; i < table.players.length; i++) {
      table.players[i].hand = [];
    }
  };

  var dealFlop = function() {
    table.discard.push(table.deck.deal());
    table.flop.push(table.deck.deal());
    table.flop.push(table.deck.deal());
    table.flop.push(table.deck.deal());
  };

  var dealTurn = function() {
    table.discard.push(table.deck.deal());
    table.turn.push(table.deck.deal());
  };

  var dealRiver = function() {
    table.discard.push(table.deck.deal());
    table.river.push(table.deck.deal());
  };
