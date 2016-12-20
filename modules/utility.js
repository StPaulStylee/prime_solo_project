// var Player = require('./player');
//
// // Find player that sent socket Event by socket ID
// function findPlayer(socket, table) {
//   return table.players.filter(function(player){
//     return player.id === socket.id;
//   })[0];
// }
//
// module.exports = Utility;
// for (var i = 0; i < ctrl.table.players.length; i++) {
//   if (currentPlayer === ctrl.table.players[i].username) {
//     // if user tries to call/bet an amount less than the big blind
//     if ((ctrl.bet + ctrl.table.players[i].moneyOnStreet) < ctrl.table.betSize) {
//       alert('You must call ' + (ctrl.table.betSize - ctrl.table.players[i].moneyOnStreet) + ' chips, raise an ' +
//              'amount greater than or equal to ' + (ctrl.table.betSize * 2) + ', or fold.');
//       return;
//       // if user tries to raise an illegal amount
//     } else if ((ctrl.bet + ctrl.table.players[i].moneyOnStreet) > ctrl.betSize && ctrl.bet < (ctrl.table.betSize * 2)) {
//         alert('You must call ' + (ctrl.table.betSize - ctrl.table.players[i].moneyOnStreet) + ' chips, raise an ' +
//            'amount greater than or equal to ' + (ctrl.table.bigBlind * 2) + ', or fold.');
//            return;
//       // if the user call the bigBlind
//     } else if ((ctrl.bet + ctrl.table.players[i].moneyOnStreet) === ctrl.table.bigBlind) {
//         pokerSocket.emit('preFlopBet', {bet: ctrl.bet});
//       // if the user raises a legal amount
//     } else if ((ctrl.bet + ctrl.table.players[i].moneyOnStreet) >= (ctrl.table.betSize * 2)) {
//         pokerSocket.emit('preFlopBet', {bet: ctrl.bet});
//     }
//   }
// }
// 
// var setTurnToAct = function() {
//   if (table.players[0].handActive == true && table.players[1].handActive == true && table.players[2].handActive == true){
//   if (table.seatToAct < table.players.length && table.seatToAct == 0) {
//     table.players[table.players.length - 1].turnToAct = false;
//     table.players[table.seatToAct].turnToAct = true;
//     table.seatToAct++;
//
//   } else if (table.seatToAct < table.players.length && table.seatToAct == 1) {
//     table.players[table.seatToAct - 1].turnToAct = false;
//     table.players[table.seatToAct].turnToAct = true;
//     table.seatToAct++;
//
//   } else if (table.seatToAct < table.players.length && table.seatToAct == 2) {
//     table.players[table.seatToAct - 1].turnToAct = false;
//     table.players[table.seatToAct].turnToAct = true;
//     table.seatToAct++;
//
//   } else if (table.seatToAct == table.players.length) {
//     table.players[table.players.length - 1].turnToAct = false;
//     table.players[0].turnToAct = true;
//     table.seatToAct = 1;
//     }
//   }
// };
