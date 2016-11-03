angular.module('pokerApp')
       service('poker', pokerService);

function pokerService($http) {

  this.login  = function () {
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

} // End of pokerService Function
