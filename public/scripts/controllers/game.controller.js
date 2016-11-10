angular.module('pokerApp')
       .controller('GameController', GameController);

function GameController(poker, pokerSocket) {
  console.log('GameController Loaded');
  var ctrl = this;
  ctrl.clicked = true;
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
  });
  ctrl.ready = function () {
    ctrl.clicked = false;
    // ctrl.readyCount++;
    // console.log(ctrl.readyCount);
    // if (ctrl.readyCount == 2) {
    //   console.log('Sending ready');
      pokerSocket.emit('ready');
  };
  pokerSocket.on('ready', function(table){
    ctrl.table = table;
    ctrl.smallBlind = table.smallBlind;
    ctrl.bigBlind = table.bigBlind;
    ctrl.potSize = table.potSize;
    var currentPlayer = poker.getCurrentPlayer();
    //console.log('From GameController: ', currentPlayer);
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        ctrl.username = ctrl.table.players[i].username;
        ctrl.card1 = ctrl.table.players[i].hand[0];
        ctrl.card2 = ctrl.table.players[i].hand[1];
        ctrl.chipStack = ctrl.table.players[i].chipStack;
      }
    }
    //console.log(ctrl.table);
  });

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
      }
    }

  });

  // pokerSocket.on('preFlopBet', function (table){
  //   console.log('Table and reception of preFlopBet from server: ', table);
  // });
}
