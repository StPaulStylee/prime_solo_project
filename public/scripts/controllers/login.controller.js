angular.module('pokerApp')
       .controller('LoginController', LoginController);

function LoginController(poker, pokerSocket, $location) { //Whats up with the $location?
  console.log('LoginController Loaded');
  var ctrl = this;
  var loginInfo = {};

  ctrl.login  = function (username, password) {
    ctrl.loginInfo = {'username': ctrl.username, 'password': ctrl.password}
    poker.login(ctrl.loginInfo).then(function(response){
      console.log('Login successful!', response.config.data.username);
      pokerSocket.emit('playerLoggedIn', {username: response.config.data.username } );
      $location.path('/game');
    }, function(error){
      console.log('From LoginController: Error logging in!', error);
    });
  };
}