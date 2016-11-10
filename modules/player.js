function Player(socketID, username) {
  this.id = socketID;
  this.username = username;
  this.hand = [];
  this.seat = '';
  this.chipStack = 1000;
  this.sessionHands = 0;
  this.dealer = false;
}

module.exports = Player;
