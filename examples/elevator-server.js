// server.js

// includes
	var Primus = require('primus');
	var PrimusEmitter = require('primus-emitter');
	var express = require('express');
	var http = require('http');
	var path = require('path');
	var elevator = require('./elevator'); // replace this with current circuit file.

	var app = express();
	app.use(express.static(path.join(__dirname,"public")));

// define API
	// example: http://192.168.0.15:8080/command/elevator_toggle

	app.get('/command/:command', function(req,res){
	     var command = req.params.command;
	     console.log("received command from api: ");
	     // do something with command
	     elevator.emit('command', command); 
	      //
	      res.send('ok');
	});

// Create server
	var server = http.createServer(app);

//  Add WebSockets support to http server
	var primus = new Primus(server);
	primus.use('emitter', PrimusEmitter);
	primus.on('connection', function(socket){
	     // If WebSockets server receives a ‘command’ event, it will process it
	     socket.on('command', function(command){

	    // We have the command, send it to the elevator code
	    elevator.emit('command', command);
	    //
	     });
	});

// Turn on sever
	server.listen(8080);
