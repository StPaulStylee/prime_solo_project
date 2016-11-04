function Table (socketID) {
  this.id = socketID;
  this.players = [];
}
Table.prototype.seatAssign = function() {
  for(var i = 0; i < this.players.length; i++) {
    this['Seat ' + (i + 1)] = this.players[i];
  }
};

module.exports = Table
