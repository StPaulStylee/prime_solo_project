angular.module('pokerApp')
       .controller('GameController', GameController);

function GameController(poker, pokerSocket) {
  console.log('GameController Loaded');
  var ctrl = this;
  ctrl.messages = [];
  ctrl.players = poker.players;
  //ctrl.table = poker;
  ctrl.table;
  //ctrl.readyCount = 0;
  ctrl.card1 = {};
  ctrl.card2 = {};

  //console.log(ctrl.table);
  //console.log(ctrl.players);
  //console.log(ctrl.table);


  ctrl.sendChat = function (msg) {
    console.log('msg', ctrl.chat);
    pokerSocket.emit('chatMessage', {msg: ctrl.chat});
    ctrl.chat = '';
  };
  pokerSocket.on('chatMessage', function(msg){
    ctrl.messages.push(msg.msg);
    console.log(ctrl.messages);
  });
  ctrl.ready = function () {
    // ctrl.readyCount++;
    // console.log(ctrl.readyCount);
    // if (ctrl.readyCount == 2) {
    //   console.log('Sending ready');
      pokerSocket.emit('ready');
  };
  pokerSocket.on('ready', function(table){
    ctrl.table = table;
    var currentPlayer = poker.getCurrentPlayer();
    console.log('From GameController: ', currentPlayer);
    for(var i = 0; i < ctrl.table.players.length; i++) {
      if (currentPlayer === ctrl.table.players[i].username) {
        ctrl.card1 = ctrl.table.players[i].hand[0];
        ctrl.card2 = ctrl.table.players[i].hand[1];
      }
    }
    console.log(ctrl.table);
    //ctrl.card1 =
    //pokerSocket.emit('start');
  });
}
