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

var port = process.env.PORT || 5000;
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


// Connect to socket.io
io.on('connection', function(socket){
  // When a user get logged in, create new player, add
  // them to the table, and assign them a seat
  socket.on('playerLoggedIn', function(data){
    console.log('Data from login:', data);
    var player = new Player(socket.id, data.username);
    table.playerCount++
    table.players.push(player);
    table.seatAssign();
    console.log('Table from Login: ', table);
  });
  // Chat socket that is available on table
  socket.on('chatMessage', function(msg){
    var player = findPlayer(socket, table);
    var message = { user: player.username, msg: msg.msg}
    io.emit('chatMessage', {username: player.username, msg: msg.msg})
  });

  // Emit table object upon reception of table key
  socket.on('table', function(){
    io.emit('table', table);
  });

  /*----------------------------------------------------------------------------
  Start of Game
  ---------------------------------------------------------------------------*/
  // On 'ready' increase ready count
  // Once 3 'ready' make the deck, shuffle, and deal
  // Then set dealer and first to act
  socket.on('ready', function(){
    table.readyCount++;
    console.log(table.readyCount);
    if(table.readyCount == 3){
      ready();
      setDealerStart();
      setTurnToActStart();
    }
    // Then set the table property 'street' to Preflop
    // and emit the table object
    table.street = 'preflop';
    console.log('Dealer button', table.dealerButton);
    console.log('Table on Ready: ', table);
    io.emit('ready', table);
  });

  /*----------------------------------------------------------------------------
  Preflop
  ---------------------------------------------------------------------------*/
  // On 'preflopBet' event, set player to player
  // who triggered the event
  // if the bet from the player is greather than
  // the highest bet in the round, set that to the new
  // highest bet amount
  socket.on('preFlopBet', function(bet){
    console.log('From pre flop BET event', bet);
    var player = findPlayer(socket, table);
    console.log('findPlayer() from pre flop BET event: ', player)
    if (bet.bet > table.highestBet) {
      table.highestBet = bet.bet
    }
    // Then update the table and player objects and
    // set turn to the next player
    table.potSize += bet.bet;
    table.betSize = bet.bet;
    player.chipStack -= bet.bet;
    player.moneyOnStreet += bet.bet
    player.handBet = true;
    setTurnToAct();
    console.log('Player AFTER pre flop BET event:', player);
    io.emit('preFlopBet', table);
  });
  // On preFlopCheck event, set player to user who triggered
  // the event and set there hand to 'checked'
  // Then, set the turn to the next player
  socket.on('preFlopCheck', function(){
    var player = findPlayer(socket, table);
    player.handCheck = true;
    console.log('findPlayer() from pre flop CHECK event', player);
    setTurnToAct();
    io.emit('preFlopCheck', table);
  });
  // When a player folds, set the player to the user who
  // triggerd it, deactive their hand, and move to the next player
  socket.on('preFlopFold', function(){
    var player = findPlayer(socket, table);
    player.handActive = false;
    setTurnToAct();
    console.log('Player after pre flop FOLD event: ', player);
    io.emit('preFlopFold', table);
  });

  /*----------------------------------------------------------------------------
  Flop
  ---------------------------------------------------------------------------*/
  // When plop is triggerd, reset all players 'moneyOnStreet'
  // property back to zero
  socket.on('flopRequest', function(){
    for (var i = 0; i < table.players.length; i++) {
      table.players[i].moneyOnStreet = 0;
    }
    // set the last bet size to 0 and reset highest bet
    // equal to the bigBlind
    // Deal the flop
    table.betSize = 0;
    table.highestBet = table.bigBlind;
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
    // Deal the turn on turn request
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
  // Deal the river on river request
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
    // Reset all players hands to active
    socket.on('nextHand', function(){
      for(var i = 0; i < table.players.length; i++) {
        table.players[i].handActive = true;
      }
      // Update the table object
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

  // disconnect from socket.io
  socket.on('disconnect', function (){
    console.log('A user has disconnected.');
  });
}); // End of socket.io








/*----------------------------------------------------------------------------
Functions
---------------------------------------------------------------------------*/
// Allows server to identify which player caused event
// by their socket id
function findPlayer(socket, table) {
  return table.players.filter(function(player){
    return player.id === socket.id;
  })[0];
}
// make the deck, shuffle it 3 times, and deal each player a hand
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
// Set the starting dealer and collect blinds
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
  }
};
// Set player whos turn it is, to their turn
var setTurnToActStart = function() {
  table.players[table.seatToAct].turnToAct = true;
  table.seatToAct++;
};
// After start, set the players turn to act
var setTurnToAct = function() {
  if (table.players[0].handActive == true && table.players[1].handActive == true && table.players[2].handActive == true){
    console.log('All Active');
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
    }

  else if (table.players[0].handActive == true && table.players[1].handActive == true && table.players[2].handActive == false) {
    console.log('Seat 1 and 2 Active');
    table.players[2].turnToAct = false;
    if (table.seatToAct < table.players.length && table.seatToAct == 0) {
      console.log('Seat To Act == 0');
      table.players[table.players.length - 1].turnToAct = false;
      table.players[table.seatToAct].turnToAct = true;
      table.seatToAct++;

    } else if (table.seatToAct < table.players.length && table.seatToAct == 1) {
      console.log('Seat to Atct == 1');
      table.players[table.seatToAct - 1].turnToAct = false;
      table.players[table.seatToAct].turnToAct = true;
      table.seatToAct++;

    } else if (table.seatToAct < table.players.length && table.seatToAct == 2) {
      console.log('Seat to Act == 2');
      table.players[table.seatToAct - 1].turnToAct = false;
      table.players[table.seatToAct].turnToAct = false;
      table.players[0].turnToAct = true;
      table.seatToAct = 1;
      }
      else if (table.seatToAct == table.players.length) {
        console.log('Seat To Act == 3');
      table.players[0].turnToAct = true;
      table.seatToAct = 1;
      }
    }

    else if (table.players[0].handActive == true && table.players[1].handActive == false && table.players[2].handActive == true) {
      console.log('Seat 1 and 3 Active');
      table.players[1].turnToAct = false;
      if (table.seatToAct < table.players.length && table.seatToAct == 0) {
        console.log('Seat To Act == 0');
        table.players[table.players.length - 1].turnToAct = false;
        table.players[table.seatToAct].turnToAct = true;
        table.seatToAct++;

      } else if (table.seatToAct < table.players.length && table.seatToAct == 1) {
        console.log('Seat to Atct == 1');
        table.players[table.seatToAct - 1].turnToAct = false;
        table.players[2].turnToAct = true;
        table.seatToAct = 3;

      } else if (table.seatToAct < table.players.length && table.seatToAct == 2) {
        console.log('Seat to Act == 2');
        table.players[table.seatToAct].turnToAct = true;
        table.seatToAct = 3;
        }
        else if (table.seatToAct == table.players.length) {
          console.log('Seat To Act == 3');
        table.players[table.seatToAct - 1].turnToAct = false;
        table.players[0].turnToAct = true;
        table.seatToAct = 1;
        }
      }

      else if (table.players[0].handActive == false && table.players[1].handActive == true && table.players[2].handActive == true){
        console.log('Seats 2 and 3 Active');
        if (table.seatToAct < table.players.length && table.seatToAct == 0) {
          console.log('Seat to Act == 0');
          // table.players[table.players.length - 1].turnToAct = false;
          // table.players[table.seatToAct].turnToAct = true;
          // table.seatToAct++;

        } else if (table.seatToAct < table.players.length && table.seatToAct == 1) {
          console.log('Seat to Act == 1');
          table.players[table.seatToAct - 1].turnToAct = false;
          table.players[table.seatToAct].turnToAct = true;
          table.seatToAct++;

        } else if (table.seatToAct < table.players.length && table.seatToAct == 2) {
          console.log('Seat to Act == 2');
          table.players[table.seatToAct - 1].turnToAct = false;
          table.players[table.seatToAct].turnToAct = true;
          table.seatToAct++;

        } else if (table.seatToAct == table.players.length) {
          console.log('Seat to Act == 3');
          table.players[table.players.length - 1].turnToAct = false;
          table.players[1].turnToAct = true;
          table.seatToAct = 2;
          }
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
  // After each hand is completed, create a new deck,
  // shuffle it 3 times, and deal each player a hand
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
  // Empty each players hand array
  var clearHands = function() {
    for(var i = 0; i < table.players.length; i++) {
      table.players[i].hand = [];
    }
  };
  // deal the flop from the deck
  var dealFlop = function() {
    table.discard.push(table.deck.deal());
    table.flop.push(table.deck.deal());
    table.flop.push(table.deck.deal());
    table.flop.push(table.deck.deal());
  };
  // deal the turn from the deck
  var dealTurn = function() {
    table.discard.push(table.deck.deal());
    table.turn.push(table.deck.deal());
  };
  // deal the river from the deck
  var dealRiver = function() {
    table.discard.push(table.deck.deal());
    table.river.push(table.deck.deal());
  };
