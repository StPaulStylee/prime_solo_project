angular.module('pokerApp')
       .service('poker', pokerService);

function pokerService($http, pokerSocket) {
  var service = this;
  service.players = [];
  service.table = {};


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
    //console.log(service.players);
    //service.table.length = 0;
    service.table = data;
    // for(var i = 0; i < data.playerCount; i++) {
    //   service.table.push(data['Seat ' + (i + 1)]);
    // }
    console.log(service.table);
  });
} // End of pokerService Function
