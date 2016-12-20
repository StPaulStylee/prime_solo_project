angular.module('pokerApp')
       .controller('LoginController', LoginController);

function LoginController(poker, pokerSocket, $location) {
  console.log('LoginController Loaded');
  var ctrl = this;
  var loginInfo = {};

  ctrl.players = [];
  ctrl.table = [];

  // When player logs in, set them as current player
  ctrl.login  = function (username, password) {
    poker.setCurrentPlayer(ctrl.username);
    ctrl.loginInfo = {'username': ctrl.username, 'password': ctrl.password}
    // Then send that player to the table to play
    poker.login(ctrl.loginInfo).then(function(response){
      console.log('Login successful!', response.config.data.username);
      pokerSocket.emit('playerLoggedIn', {username: response.config.data.username } );
      poker.getTable();
      $location.path('/game');
    }, function(error){
      console.log('From LoginController: Error logging in!', error);
    });
  };



}
