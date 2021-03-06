var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
var cont = 0;
io.on('connection', function (socket) {
  console.log('a user connected');

  if (cont == 0) {
    players[socket.id] = {

      x: 35 + (35 / 2),
      y: 35 + (35 / 2),
      playerId: socket.id,
      animation: null,
      bombCount: 0
    };
    cont += 1;
  } else if (cont == 1) {
    players[socket.id] = {
      x: (23 * 35) + (35 / 2),
      y: (15 * 35) + (35 / 2),
      playerId: socket.id,
      animation: null,
      bombCount: 0
    };
    cont += 1;
  } else {
    console.log('users limit reached');
  }
  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  socket.on('PonerBomba', function (movementBomb) {
    io.sockets.emit('Bomba', movementBomb)
  });

  socket.on('EmitirGameO', function (movementBomb) {
    io.sockets.emit('Showgameover')
  });



  socket.on('disconnect', function () {
    console.log('user disconnected');
    cont -= 1;
    // remove this player from our players object
    delete players[socket.id];
    // emit a message to all players to remove this player
    io.emit('disconnect', socket.id);
  });
  // when a player moves, update the player data
  socket.on('playerMovement', function (movementData, ani) {
    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;
    players[socket.id].animation = ani;
    // emit a message to all players about the player that moved
    socket.broadcast.emit('playerMoved', players[socket.id]);
  });
});

server.listen(8081, function () {
  console.log(`Listening on ${server.address().port}`);
});

