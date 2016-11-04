angular.module('pokerApp')
       .controller('AccountController', AccountController);

function AccountController(poker) {
  console.log('AccountController Loaded');
  var ctrl = this;

  ctrl.getBank = function() {
    poker.getBank().then(function(response){
      console.log('Response from AccountController on GET request: ', response);
    })
  }


}
