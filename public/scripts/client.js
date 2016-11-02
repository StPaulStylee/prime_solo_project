$(function() {
  $('form').on('submit', function(){
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;  //What this do?
  });
  socket.on('chat message', function (msg){
    console.log('Message received from server emit: ', msg);
    $('#messages').append($('<li>').text(msg));
  });
});
// No URL needed because it defaults to connect to host that serves page.
var socket = io.connect('http://localhost:3000');
var message = [];

 // socket.on('greeting', function (data){
 //   console.log('log from client:  ', data);
 //   socket.emit('client reply', {'client reply': 'Top of the mornin to ya!'});
 //   message.push(data);
 // })
