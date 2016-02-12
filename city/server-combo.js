// server.js

// Dependencies
	var Primus = require('primus');
	var PrimusEmitter = require('primus-emitter');
	var express = require('express');
	var http = require('http');
	var path = require('path');
	// The config file will be used to store API details. Its separate for security reasons.
	var config = require('./config');



	// used for debugging purposes
	var util = require('util');
		//Example: console.log(util.inspect(configs, false, null));


//  Circuit communication
	var fork = require('child_process').fork;
	var circuit = fork(__dirname + '/circuit-master.js');	// Update circuit file as needed for each project

	circuit.send("Server: Hello via circuit");

	// Receive communication from circuit (pre-websocket)
	/*
	circuit.on('message', function(message) {
		console.log("message from circuit: ", message);
	});
	*/


//Setting the path to static assets
	var app = express();
	app.use(express.static(path.join(__dirname,"public")));
	//Serving the static HTML file
	app.get('/', function (res) {
	    res.sendFile('/index.html')
	});

// Define API
	// example: http://192.168.0.15:8080/command/crossing

	app.get('/command/:command', function(req,res){
	     var command = req.params.command;
	     console.log("Server: received command from api: ");
	     // do something with command
	     circuit.send({'command': command});
	     res.send('ok');
	});

// Create server
	var server = http.createServer(app);




//  Add WebSockets support to http server
	var primus = new Primus(server, { transformer: 'websockets', parser: 'JSON' });
	primus.use('emitter', PrimusEmitter);
	primus.on('connection', function(spark){
		console.log("Server: websocket client connected",spark.id);
			// Send to websocket client
			spark.send('news', 'Howdy! You are connected to the IoL');

	    // If WebSockets server receives a ‘command’ event, it will process it
	    spark.on("command", function(command){
	    	console.log("socket command: ", command);

		    // We have the command, send it to the circuit code
		    circuit.send({'command': command});
	     });

	    // If WebSockets server receives a 'data' event, it will process it
	    spark.on('data', function(data){
	    	console.log("socket data: ", data);
	    });

	    // Revieve data from circuit
		circuit.on('message', function(msg) {
			console.log("Circuit: Message received - ", msg);
			spark.send('news', "Message from circuit coming in!");
			spark.send('news', msg.trafficSignalState);
			console.log("msg.trafficSignalState = ", msg.trafficSignalState);
			spark.send('data', msg);

		});

	});

// Turn on sever
	server.listen(8080);
	console.log("HTTP Server listening on port 8080");

/* -----------------------------------------------------------------------------
// PubNub.com Integration
// https://github.com/pubnub/javascript/tree/master/node.js
----------------------------------------------------------------------------- */
	var pubnub = require("pubnub")({
			ssl           : true,  // <- enable TLS Tunneling over TCP
			publish_key   : config.pubnub.publish_key,
			subscribe_key : config.pubnub.subscribe_key
	});

	/* ---------------------------------------------------------------------------
	Publish PubNub Messages
	--------------------------------------------------------------------------- */
	var message = { "news" : "iol server ready" };
	pubnub.publish({
	    channel   : 'iol',
	    message   : message,
	    callback  : function(e) { console.log( "Server: PubNub SUCCESS!", e ); },
	    error     : function(e) { console.log( "Server: PubNub FAILED! RETRY PUBLISH!", e ); }
	});

	circuit.on('message', function(msg) {
		console.log("circuit.on(message) publish to pubnub channel - iol: ");
		console.log(util.inspect(msg, false, null));
		pubnub.publish({
		    channel   : 'iol',
		    message   : msg,
		})
	});

	/* ---------------------------------------------------------------------------
	Listen for PubNub Messages
	--------------------------------------------------------------------------- */

	pubnub.subscribe({
			channel  : "iol",
			callback : function(message) {
					console.log( "Server: PubNub Received message and sending to ciruit: ", message );
					circuit.send(message);
			}
	});

/* -----------------------------------------------------------------------------
// Meshblu.com Integration
// https://developer.octoblu.com/docs/nodejs-example
----------------------------------------------------------------------------- */

	var meshblu = require('meshblu');
  var request = require('request');

  var conn = meshblu.createConnection({
		  "uuid": "2561d2d0-62fb-4ccc-a331-7fbc0445b7b3",
      "token": "c2976012d0b94ceae9209ff3c3273a3a7f8ec72d"
  });

  conn.on('ready', function(data){
    console.log('Ready');

    conn.on('message', function(data){
        console.log(data);
				console.log( "Server: Meshblu received message and sending to ciruit: ", data );
				circuit.send(data);
    });

    conn.status(function (data) {
      console.log(data);
  	});

    conn.message({
        "devices": "2561d2d0-62fb-4ccc-a331-7fbc0445b7b3",
        "payload": {
            "hello":"world"
        }
    });

		circuit.on('message', function(msg) {
			conn.message({
	        //"devices": "115662ca-b7d4-4a6a-8acc-f89603476289",
	        "payload": {
	            "news":msg
	        }
	    });
		});

	});
