angular.module('pokerApp')
       .controller('LobbyController', LobbyController);

function LobbyController(pokerSocket) {
  var ctrl = this;

  console.log('LobbyController loaded');
  pokerSocket.on('greeting', function(data){
    console.log('log from client:', data);
    pokerSocket.emit('client reply', {'client reply': 'Bout fuckin' + ' time!'})
  });

}
