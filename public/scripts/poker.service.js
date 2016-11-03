angular.module('pokerApp')
       .service('poker', pokerService);

function pokerService($http) {

  this.login  = function (loginInfo) {
    return $http.post('/login', loginInfo)
      .then(function(response){
        return response;
    });
  };

  this.getBank = function() {
    return $http.get('/account')
      .then(function(response){
        return response;
      });
  }
} // End of pokerService Function
