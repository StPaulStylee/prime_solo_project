angular.module('pokerApp')
       .controller('GameController', GameController);

function GameController(poker, pokerSocket) {
  console.log('GameController Loaded');
  var ctrl = this;
  ctrl.messages = [];
  ctrl.players = poker.players;
  ctrl.table = poker;


  //console.log(ctrl.table);
  //console.log(ctrl.players);
  console.log(ctrl.table);


  ctrl.sendChat = function (msg) {
    console.log('msg', ctrl.chat);
    pokerSocket.emit('chatMessage', {msg: ctrl.chat});
    ctrl.chat = '';
  };
  pokerSocket.on('chatMessage', function(msg){
    ctrl.messages.push(msg.msg);
    console.log(ctrl.messages);
  });


}
