angular.module('pokerApp')
       .controller('LoginController', LoginController);

function LoginController($http, $location) { //Whats up with the $location?
  console.log('LoginController Loaded');
  var ctrl = this;

  ctrl.login  = function () {
    console.log('From LoginController: Logging In...');
    $http.post('/login', {
      username: ctrl.username,
      password: ctrl.password
    }).then(function(){
      console.log('Login successful!');
      $location.path('/lobby'); //Is this where we are redirected upon successful login?
    }, function(error) {
      console.log('From LoginController: Error logging in!', error);
    });
  };
}
