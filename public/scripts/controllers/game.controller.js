angular.module('pokerApp')
       .controller('GameController', GameController);

function GameController(poker, pokerSocket) {
  console.log('GameController Loaded');
  var ctrl = this;
  ctrl.messages = [];
  ctrl.table;
  ctrl.card1 = {};
  ctrl.card2 = {};
  ctrl.chipStack;
  ctrl.smallBlind;
  ctrl.bigBlind;
  ctrl.potSize;
  ctrl.highestBet;
  ctrl.username;
  ctrl.readyClick = false;
  ctrl.turnToAct = false;

  // Send chat even that contains a message object
  ctrl.sendChat = function (msg) {
    pokerSocket.emit('chatMessage', {msg: ctrl.chat});
    ctrl.chat = '';
  };
  // On reception of chat message even from server,
  // push the message to the messages array
  pokerSocket.on('chatMessage', function(msg){
    ctrl.messages.push(msg);
  });

/*----------------------------------------------------------------------------
Start of Game
---------------------------------------------------------------------------*/
 // When player clicks 'ready' emit 'ready' event
  ctrl.ready = function () {
    ctrl.readyClick = true;
    pokerSocket.emit('ready');
  };
  // On ready, set table variables to be bound to the DOM
  pokerSocket.on('ready', function(table){
    ctrl.table = table;
    ctrl.smallBlind = table.smallBlind;
    ctrl.bigBlind = table.bigBlind;
    ctrl.potSize = table.potSize;
    ctrl.highestBet = table.highestBet;

    // Set player's view to reflect their stat's in the UI
    var currentPlayer = poker.getCurrentPlayer();
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        ctrl.username = ctrl.table.players[i].username;
        ctrl.card1 = ctrl.table.players[i].hand[0];
        ctrl.card2 = ctrl.table.players[i].hand[1];
        ctrl.chipStack = ctrl.table.players[i].chipStack;
        ctrl.turnToAct = ctrl.table.players[i].turnToAct;
        ctrl.moneyOnStreet = ctrl.table.players[i].moneyOnStreet;
        console.log(ctrl.table.players[i].moneyOnStreet);
      }
    }
  });

  /*----------------------------------------------------------------------------
  Preflop
  ---------------------------------------------------------------------------*/

  ctrl.sendBet = function() {
    var currentPlayer = poker.getCurrentPlayer();
    for (var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        // if user tries to call/bet an amount less than the big blind/current bet
        if ((ctrl.bet + ctrl.table.players[i].moneyOnStreet) < ctrl.table.highestBet || (ctrl.bet + ctrl.table.players[i].moneyOnStreet) < ctrl.table.bigBlind) {
          alert('You must call ' + (ctrl.table.highestBet - ctrl.table.players[i].moneyOnStreet) + ' chips, raise an ' +
                 'amount greater than or equal to ' + ((ctrl.table.highestBet * 2) - ctrl.table.players[i].moneyOnStreet) + ', or fold.');
          return;
          // if user tries to raise an illegal amount
        } else if ((ctrl.bet + ctrl.table.players[i].moneyOnStreet) > ctrl.highestBet && (ctrl.bet + ctrl.table.players[i].moneyOnStreet) < (ctrl.table.highestBet * 2)) {
            alert('You must call ' + (ctrl.table.highestBet - ctrl.table.players[i].moneyOnStreet) + ' chips, raise an ' +
               'amount greater than or equal to ' + ((ctrl.table.highestBet * 2) - ctrl.table.players[i].moneyOnStreet) + ', or fold.');
          // if the user call the bigBlind
        } else if ((ctrl.bet + ctrl.table.players[i].moneyOnStreet) === ctrl.table.highestBet || (ctrl.bet + ctrl.table.players[i].moneyOnStreet)) {
            pokerSocket.emit('preFlopBet', {bet: ctrl.bet});
          // if the user raises a legal amount
        } else if ((ctrl.bet + ctrl.table.players[i].moneyOnStreet) >= (ctrl.table.highestBet * 2)) {
            pokerSocket.emit('preFlopBet', {bet: ctrl.bet});
        }
      }
    }
    ctrl.bet = '';
  };

  // On preFlopBet event, update variables bound to DOM
  pokerSocket.on('preFlopBet', function(table){
    console.log('From pre flop bet event: ', table);
    ctrl.table = table;
    ctrl.potSize = table.potSize;
    ctrl.highestBet = table.highestBet;
    // Set player's view to reflect their stat's in the UI
    var currentPlayer = poker.getCurrentPlayer();
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        ctrl.chipStack = ctrl.table.players[i].chipStack;
        ctrl.turnToAct = ctrl.table.players[i].turnToAct;
        ctrl.moneyOnStreet = ctrl.table.players[i].moneyOnStreet;
      }
    }
  });
  // If player tries to check...
  ctrl.sendCheck = function() {
    var currentPlayer = poker.getCurrentPlayer();
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        // if user checks but hasn't paid the blind or the bet is higher than the blind, get an alert.
        if (ctrl.table.players[i].moneyOnStreet < ctrl.table.bigBlind || ctrl.table.players[i].moneyOnStreet < ctrl.table.highestBet ) {
          alert('You must call ' + (ctrl.table.highestBet - ctrl.table.players[i].moneyOnStreet) + ' chips, raise to an ' +
                 'amount greater than or equal to ' + (ctrl.table.highestBet * 2) + ', or fold.');
          return;
          // if user checks and has already paid the blind and noone has raised, the check is allowed
        } else if (ctrl.table.players[i].moneyOnStreet == ctrl.table.bigBlind && ctrl.table.players[i].moneyOnStreet == ctrl.table.highestBet ) {
            pokerSocket.emit('preFlopCheck');
          }
      }
    }
  };

  // On preFlopCheck event, update variables bound to DOM
  pokerSocket.on('preFlopCheck', function(table){
    console.log('From preFlopCheck: ', table);
    ctrl.table = table;
    ctrl.potSize = table.potSize;
    ctrl.highestBet = table.highestBet;
    var currentPlayer = poker.getCurrentPlayer();
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        ctrl.chipStack = ctrl.table.players[i].chipStack;
        ctrl.turnToAct = ctrl.table.players[i].turnToAct;
        ctrl.moneyOnStreet = ctrl.table.players[i].moneyOnStreet;
      }
    }
  });

  // Emit fold event
  ctrl.sendFold = function() {
    var currentPlayer = poker.getCurrentPlayer();
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        pokerSocket.emit('preFlopFold');
      }
    }
  };
  // On preFlopFold event, update variables bound to DOM

  pokerSocket.on('preFlopFold', function(table){
    console.log('From pre flop fold: ', table);
    ctrl.table = table;
    ctrl.potSize = table.potSize;
    ctrl.highestBet = table.highestBet;
    var currentPlayer = poker.getCurrentPlayer();
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        ctrl.chipStack = ctrl.table.players[i].chipStack;
        ctrl.turnToAct = ctrl.table.players[i].turnToAct;
        ctrl.moneyOnStreet = ctrl.table.players[i].moneyOnStreet;
      }
    }
  });



  /*----------------------------------------------------------------------------
  Flop
  ---------------------------------------------------------------------------*/

    ctrl.nextHand = function() {
      pokerSocket.emit('nextHand');
    };

    pokerSocket.on('nextHand', function(table){
      console.log('New Table Object for nextHand: ', table);
      ctrl.table = table;
      ctrl.smallBlind = table.smallBlind;
      ctrl.bigBlind = table.bigBlind;
      ctrl.potSize = table.potSize;
      ctrl.highestBet = table.highestBet;
      ctrl.flop = table.flop;
      ctrl.turn = table.turn;
      ctrl.river = table.river;

      var currentPlayer = poker.getCurrentPlayer();
      for(var i = 0; i < ctrl.table.players.length; i++) {
        if (currentPlayer === ctrl.table.players[i].username) {
          ctrl.username = ctrl.table.players[i].username;
          ctrl.card1 = ctrl.table.players[i].hand[0];
          ctrl.card2 = ctrl.table.players[i].hand[1];
          ctrl.chipStack = ctrl.table.players[i].chipStack;
          ctrl.turnToAct = ctrl.table.players[i].turnToAct;
        }
      }
    });

// Send flopRequest event
  ctrl.getFlop = function() {
    pokerSocket.emit('flopRequest');
  };
// Receives flopRequest and updates flop array
  pokerSocket.on('flopRequest', function(table){
    ctrl.table = table;
    ctrl.highestBet = table.highestBet;
    ctrl.flop = table.flop;
  });
// Send turnRequest event
  ctrl.getTurn = function() {
    pokerSocket.emit('turnRequest');
  };
// Receives turnRequestand updates turn array
  pokerSocket.on('turnRequest', function(table){
    ctrl.table = table;
    ctrl.turn = table.turn;
  });
// Send riverRequest event
  ctrl.getRiver = function() {
    pokerSocket.emit('riverRequest');
  };
// Receives riverRequest and updates river array
  pokerSocket.on('riverRequest', function(table){
    ctrl.table = table;
    ctrl.river = table.river;
  });




} // End of GameController
