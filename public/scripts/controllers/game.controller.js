angular.module('pokerApp')
       .controller('GameController', GameController);

function GameController(poker, pokerSocket) {
  console.log('GameController Loaded');
  var ctrl = this;
  ctrl.messages = [];
  //ctrl.players = poker.players;
  //ctrl.table = poker;
  ctrl.table;
  //ctrl.readyCount = 0;
  ctrl.card1 = {};
  ctrl.card2 = {};
  ctrl.chipStack;
  ctrl.smallBlind;
  ctrl.bigBlind;
  ctrl.potSize;
  ctrl.betSize;
  ctrl.username;
  ctrl.readyClick = false;
  ctrl.turnToAct = false;

  //console.log(ctrl.table);
  //console.log(ctrl.players);
  //console.log(ctrl.table);


  ctrl.sendChat = function (msg) {
    //console.log('msg', ctrl.chat);
    pokerSocket.emit('chatMessage', {msg: ctrl.chat});
    ctrl.chat = '';
  };
  pokerSocket.on('chatMessage', function(msg){
    //console.log('on chat message response, ', msg);

    ctrl.messages.push(msg);

     //console.log(ctrl.messages);
/*----------------------------------------------------------------------------
Start of Game
---------------------------------------------------------------------------*/

  });
  ctrl.ready = function () {
    ctrl.readyClick = true;

      pokerSocket.emit('ready');
  };
  pokerSocket.on('ready', function(table){
    ctrl.table = table;
    ctrl.smallBlind = table.smallBlind;
    ctrl.bigBlind = table.bigBlind;
    ctrl.potSize = table.potSize;

    // console.log(ctrl.turnToAct);
    // console.log(table.players[0].turnToAct);
    var currentPlayer = poker.getCurrentPlayer();
    //console.log('From GameController: ', currentPlayer);
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        ctrl.username = ctrl.table.players[i].username;
        ctrl.card1 = ctrl.table.players[i].hand[0];
        ctrl.card2 = ctrl.table.players[i].hand[1];
        ctrl.chipStack = ctrl.table.players[i].chipStack;
        ctrl.turnToAct = ctrl.table.players[i].turnToAct;
        console.log(ctrl.card1);
      }
    }
  });

  /*----------------------------------------------------------------------------
  Preflop
  ---------------------------------------------------------------------------*/

  ctrl.sendBet = function() {
    // ctrl.potSize += ctrl.bet;
    // ctrl.table.potSize += ctrl.bet;
    // ctrl.chipStack -= ctrl.bet;
    //console.log('From sendBet: ', ctrl.table.players[i]);
    //ctrl.table.players[i].chipStack -= ctrl.bet;
    ctrl.table.betSize = ctrl.bet;
    pokerSocket.emit('preFlopBet', {bet: ctrl.bet});
    ctrl.bet = '';
  };

  pokerSocket.on('preFlopBet', function(table){
    ctrl.table = table;
    ctrl.potSize = table.potSize;
    ctrl.betSize = table.betSize;
    var currentPlayer = poker.getCurrentPlayer();
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        ctrl.chipStack = ctrl.table.players[i].chipStack;
        ctrl.turnToAct = ctrl.table.players[i].turnToAct;
      }
    }
    // for(var i = 0; i < ctrl.table.players.length; i++) {
    //   if (currentPlayer === ctrl.table.players[i].username) {
    //     // if user checks but hasn't paid the blind or the bet is higher than the blind, get an alert.
    //     if (ctrl.table.players[i].moneyOnStreet < ctrl.table.bigBlind && ctrl.table.betSize < ctrl.table.bigBlind) {
    //       alert('You must call ' + (ctrl.table.bigBlind - ctrl.table.players[i].moneyOnStreet) + ' chips.');
    //       return
    //     }
    //     // if you checks and has already paid the blind and noone has raised, the check is allowed
    //   } else if (currentPlayer === ctrl.table.players[i].username) {
    //       if (ctrl.table.players[i].moneyOnStreet == ctrl.table.bigBlind && ctrl.table.betSize < ctrl.table.bigBlind) {
    //         pokerSocket.emit('preFlopCheck');
    //       }
    //   }
    // }
  });

  ctrl.check = function() {
    var currentPlayer = poker.getCurrentPlayer();
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        // if user checks but hasn't paid the blind or the bet is higher than the blind, get an alert.
        if (ctrl.table.players[i].moneyOnStreet < ctrl.table.bigBlind && ctrl.table.betSize < ctrl.table.bigBlind) {
          alert('You must call ' + (ctrl.table.bigBlind - ctrl.table.players[i].moneyOnStreet) + ' chips, raise an ' +
                 'amount greater than or equal to ' + (ctrl.table.bigBlind * 2) + ', or fold.');
          return;
        }
        // if you checks and has already paid the blind and noone has raised, the check is allowed
      } else if (currentPlayer === ctrl.table.players[i].username) {
          if (ctrl.table.players[i].moneyOnStreet == ctrl.table.bigBlind && ctrl.table.betSize < ctrl.table.bigBlind) {
            pokerSocket.emit('preFlopCheck');
          }
      }
    }
  };

  // pokerSocket.on('preFlopCheckError', function(){
  //   var currentPlayer = poker.getCurrentPlayer();
  //   for(var i = 0; i < ctrl.table.players.length; i++) {
  //     if (currentPlayer === ctrl.table.players[i].username) {
  //       alert('If no player has raised, you must call the amount of the Big Blind.')
  //     }
  //   }
  // });

  pokerSocket.on('preFlopCheck', function(table){
    console.log('From preFlopCheck: ', table);
    ctrl.table = table;
    ctrl.potSize = table.potSize;
    ctrl.betSize = table.betSize;
    var currentPlayer = poker.getCurrentPlayer();
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        ctrl.chipStack = ctrl.table.players[i].chipStack;
        ctrl.turnToAct = ctrl.table.players[i].turnToAct;
      }
    }
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        // if user checks but hasn't paid the blind or the bet is higher than the blind, get an alert.
        if (ctrl.table.players[i].moneyOnStreet < ctrl.table.bigBlind && ctrl.table.betSize < ctrl.table.bigBlind) {
          alert('You must call ' + (ctrl.table.bigBlind - ctrl.table.players[i].moneyOnStreet) + ' chips, raise an ' +
                 'amount greater than or equal to ' + (ctrl.table.bigBlind * 2) + ' or fold.');
          return
        }
        // if you checks and has already paid the blind and noone has raised, the check is allowed
      } else if (currentPlayer === ctrl.table.players[i].username) {
          if (ctrl.table.players[i].moneyOnStreet == ctrl.table.bigBlind && ctrl.table.betSize < ctrl.table.bigBlind) {
            pokerSocket.emit('preFlopCheck');
          }
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
      ctrl.betSize = table.betSize;
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
    ctrl.betSize = table.betSize;
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
