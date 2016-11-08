var Deck = require('./deck');

function Table (tableName) {
  this.id = 1;
  this.tableName = tableName;
  this.playerCount = 0;
  this.readyCount = 0;
  this.players = [];
  this.deck = new Deck();
  // this.seats = {};
  // this.hands = {};
  //this.dealer = ???
}
Table.prototype.seatAssign = function() {
  for(var i = 0; i < this.playerCount; i++) {
    this.players[i].seat = i + 1;
    //this.seats['Seat ' + (i + 1)] = this.players[i].;
  }
};

// Table.prototype.handAssign = function() {
//   for(var i = 0; i < this.playerCount; i++) {
//     this.hands['Seat ' + (i + 1)] = [];
//   }
// };

module.exports = Table;
