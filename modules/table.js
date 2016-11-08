var Deck = require('./deck');

function Table (tableName) {
  this.id = 1;
  this.tableName = tableName;
  this.playerCount = 0;
  this.players = [];
  this.deck = new Deck();
  this.seats = {};
}
Table.prototype.seatAssign = function() {
  for(var i = 0; i < this.playerCount; i++) {
    this.seats['Seat ' + (i + 1)] = this.players[i];
  }
};

Table.prototype.deck = function() {

}

module.exports = Table;
