// server.js
// This Server connects runs the dashboard and connects via PubNub messaging service

// Dependencies
	var express = require('express');
	var http = require('http');
	var path = require('path');
	// The config file will be used to store API details. Its separate for security reasons.
	var config = require('./config');
	var pubnub = require("pubnub")({
			ssl           : true,  // <- enable TLS Tunneling over TCP
			publish_key   : config.pubnub.publish_key,
			subscribe_key : config.pubnub.subscribe_key
	});
//Setting the path to static assets
	var app = express();
	app.use(express.static(path.join(__dirname,"public")));
	//Serving the static HTML file
	app.get('/', function (res) {
	    res.sendFile('/index-pn.html')
	});

// Define API
	// example: http://192.168.0.15:8080/command/crossing

	app.get('/command/:command', function(req,res){
	     var command = req.params.command;
	     console.log("Server: received command from api: ");
	     // publish command to PubNub channel
			 var message = { "news" : "iol remote Dashboard server ready" };
			 pubnub.publish({
					 channel   : 'iol',
					 message   : {'command':command},
					 callback  : function(e) { console.log( "Server: PubNub SUCCESS!", e ); },
					 error     : function(e) { console.log( "Server: PubNub FAILED! RETRY PUBLISH!", e ); }
			 });
	     res.send('ok');
	});

// Create server
	var server = http.createServer(app);

// Turn on sever
	server.listen(8080);
	console.log("HTTP Server listening on port 8080");


// PubNub Integration

	/* ---------------------------------------------------------------------------
	Publish Messages
	--------------------------------------------------------------------------- */
	var message = { "news" : "iol remote Dashboard server ready" };
	pubnub.publish({
	    channel   : 'iol',
	    message   : message,
	    callback  : function(e) { console.log( "Server: PubNub SUCCESS!", e ); },
	    error     : function(e) { console.log( "Server: PubNub FAILED! RETRY PUBLISH!", e ); }
	});
