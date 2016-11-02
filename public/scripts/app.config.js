angular.module('pokerApp')
       .config(function($routeProvider, $locationProvider) {
         $routeProvider.when('/login', {
           templateUrl: 'views/login.html',
           controller: 'LoginController as login'
         }).when('/lobby', {
           templateUrl: 'views/lobby.html',
           controller: 'LobbyController as lobby'
         }).when('/register', {
           templateUrl: 'views/register.html',
           controller: 'RegisterController as register'
         }).when('/account', {
           templateUrl: 'views/account.html',
           controller: 'AccountController as account'
         }).when('/editProfile', {
           templateUrl: 'views/editProfile.html',
           controller: 'ProfileController as profile'
         }).when('/game', {
           templateUrl: 'views/game.html',
           controller: 'GameController as game'
         }).otherwise({
           redirectTo: '/login'
         });


         // lets us use normal looking links
         // i.e. /home
         // remember, to use this, need to set base href in html
         $locationProvider.html5Mode(true);
       });
