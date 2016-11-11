'use strict';
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use(express.static(__dirname + '/static'))
  .listen(PORT, () => console.log('Listening on ${ PORT }'));

const io = socketIO(server);

io.on('connection', function(socket){
  socket.on('event', function(json){
	  var evt = JSON.parse(json);
    var session = evt.session;
	  var evtType = evt.type;
    var body = evt.body;
    io.emit(evt.session, json);
  });
});
