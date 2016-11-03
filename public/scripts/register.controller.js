angular.module('pokerApp')
       .controller('RegisterController', RegisterController);

function RegisterController($http, $location) {
  console.log('RegisterController Loaded');
  var ctrl = this;

  ctrl.register = function() {
    console.log('From RegisterController: Registering a new user...');
    $http.post('/register', {
      type: 'user',
      username: ctrl.username,
      password: ctrl.password,
      bankroll: 400
    }).then(function(){
      $location.path('/login');
    }, function(error){
      console.log('From RegisterController: Error registering new user!', error);
    });
  };
}
