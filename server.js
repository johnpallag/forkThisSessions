'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log('Listening on ${ PORT }'));

const io = socketIO(server);

io.on('connection', function(socket){
  socket.on('sessionUpdate', function(json){
	  var body = JSON.parse(json);
	  var msg = body.msg;
    io.emit(body.session + "-updated", msg);
  });
});