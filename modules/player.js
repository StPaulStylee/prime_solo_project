function Player(socketID, username) {
  this.id = socketID;
  this.username = username;
  this.hand = [];
  this.seat = '';
}

module.exports = Player;
