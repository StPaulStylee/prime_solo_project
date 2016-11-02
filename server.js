var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/*', function(req, res){
  res.sendFile(path.join(__dirname, 'public/views/index.html'));
});



var port = process.env.PORT || 3000;
var server = app. listen(port, function () {
  console.log('Listening on port ', server.address().port);
});
var io = require('socket.io')(server);

io.on('connection', function(socket){
  console.log('On connection to server: ', 'A user connected!');
  socket.on('disconnect', function (){
    console.log('A user has disconnected');
  });
  socket.emit('greeting', { greeting: 'Your angular socket is working!'});
  socket.on('client reply', function (data){
  console.log('log from server', data);
  })
  // socket.on('chat message', function(msg){
  //   console.log('Message to emit: ', msg);
  //   io.emit('chat message', msg);
  // });
});
