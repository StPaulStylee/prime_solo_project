function Player(socketID, username) {
  this.id = socketID;
  this.username = username;
  this.hand = [];
  this.handActive = true;
  this.turnToAct = false;
  this.handCheck = false;
  this.handBet = false;
  this.moneyOnStreet = 0;
  this.seat = '';
  this.chipStack = 1000;
  this.sessionHands = 0;
  this.dealer = false;
  this.smallBlind = false;
  this.bigBlind = false;
}

module.exports = Player;
