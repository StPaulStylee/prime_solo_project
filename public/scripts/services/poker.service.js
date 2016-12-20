angular.module('pokerApp')
       .service('poker', pokerService);

function pokerService($http, pokerSocket) {
  var service = this;
  service.players = [];
  service.table = {};
  service.currentPlayer = '';


  service.login  = function (loginInfo) {
    return $http.post('/login', loginInfo)
      .then(function(response){
        return response;
    });
  };

  service.getBank = function() {
    return $http.get('/account')
      .then(function(response){
        return response;
      });
  }
  service.getTable = function () {
    pokerSocket.emit('table', {});
  };
  pokerSocket.on('table', function(data){
    service.players =  data.players;
    service.table = data;
  });

  service.setCurrentPlayer = function (player) {
    service.currentPlayer = player;
  }

  service.getCurrentPlayer = function () {
    return service.currentPlayer;
  }
} // End of pokerService Function
