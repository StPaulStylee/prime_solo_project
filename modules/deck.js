// Contructors buiit from demo: www.brainjar.com/js/cards/default.asp
var Table = require('./table');

function Card(rank, suit) {
  this.rank = rank;
  this.suit = suit;

  // this.toString = cardToString;
  // this.createNode = cardCreateNode
}

function Deck() {
  this.cards = new Array();
  this.makeDeck = makeDeck;
  this.shuffle = shuffle;
  this.deal = deal;

  // this.draw = draw;
  // this.addCard = addCard;
  // this.combine = combine;
  //this.cardCount = cardCount;
}

function makeDeck(n) {
  var ranks = new Array('A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K');
  var suits = new Array('C', 'D', 'H', 'S');
  var i;
  var j;
  var k;
  var m;

  m = ranks.length * suits.length;

  this.cards = new Array(n * m);

// This specifies the number of decks to be made
  for (i = 0; i < n; i++) {
    for (j = 0; j < suits.length; j++) {
      for (k = 0; k < ranks.length; k++) {
        this.cards[i * m + j * ranks.length + k] =
          new Card(ranks[k], suits[j]);
        }
      }
    }
}

// This specifies how many times to shuffle the deck
function shuffle(n) {
  var i;
  var j;
  var k;
  var temp;

  for (i = 0; i < n; i++) {
    for (j = 0; j < this.cards.length; j++) {
      k = Math.floor(Math.random() * this.cards.length);
      temp = this.cards[j];
      this.cards[j] = this.cards[k];
      this.cards[k] = temp;
    }
  }
}

function deal() {

  if (this.cards.length > 0) {
    return this.cards.shift();
  } else {
    return null;
  }
}

// function cardToString() {
//
//   var rank;
//   var suit;
//
//   switch (this.rank) {
//     case "A" :
//       rank = "Ace";
//       break;
//     case "2" :
//       rank = "Two";
//       break;
//     case "3" :
//       rank = "Three";
//       break;
//     case "4" :
//       rank = "Four";
//       break;
//     case "5" :
//       rank = "Five";
//       break;
//     case "6" :
//       rank = "Six";
//       break;
//     case "7" :
//       rank = "Seven";
//       break;
//     case "8" :
//       rank = "Eight";
//       break;
//     case "9" :
//       rank = "Nine";
//       break;
//     case "10" :
//       rank = "Ten";
//       break;
//     case "J" :
//       rank = "Jack"
//       break;
//     case "Q" :
//       rank = "Queen"
//       break;
//     case "K" :
//       rank = "King"
//       break;
//     default :
//       rank = null;
//       break;
//   }
//
//   switch (this.suit) {
//     case "C" :
//       suit = "Clubs";
//       break;
//     case "D" :
//       suit = "Diamonds"
//       break;
//     case "H" :
//       suit = "Hearts"
//       break;
//     case "S" :
//       suit = "Spades"
//       break;
//     default :
//       suit = null;
//       break;
//   }
//
//   if (rank == null || suit == null)
//     return "";
//
//   return rank + " of " + suit;
// }

module.exports = Deck;
