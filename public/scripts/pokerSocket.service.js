angular.module('pokerApp')
       .factory('pokerSocket', function(socketFactory){
         return socketFactory();
       });
