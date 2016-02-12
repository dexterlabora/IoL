// server.js

// Dependencies
	var Primus = require('primus');
	var PrimusEmitter = require('primus-emitter');
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

	// used for debugging purposes
	var util = require('util');
		//Example: console.log(util.inspect(configs, false, null));


//  Circuit communication
	var fork = require('child_process').fork;
	var circuit = fork(__dirname + '/circuit-weather.js');	// Update circuit file as needed for each project

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
  var port = 3030;
	server.listen(port);
	console.log("HTTP Server listening on port "+ port);


// PubNub Integration

	/* ---------------------------------------------------------------------------
	Publish Messages
	--------------------------------------------------------------------------- */
	var message = { "news" : "weather station server ready" };
	pubnub.publish({
	    channel   : 'iol',
	    message   : message,
	    callback  : function(e) { console.log( "Server: PubNub SUCCESS!", e ); },
	    error     : function(e) { console.log( "Server: PubNub FAILED! RETRY PUBLISH!", e ); }
	});

	circuit.on('message', function(msg) {
		console.log("circuit.on message and sending to pubnub channel: "+msg);
		pubnub.publish({
		    channel   : 'iol',
		    message   : msg,
		})
	});

	/* ---------------------------------------------------------------------------
	Listen for PubNub Messages
	--------------------------------------------------------------------------- */


	pubnub.subscribe({
			channel  : "weather",
			callback : function(message) {
					console.log( "Server: PubNub Received message and sending to ciruit: ", message );
					circuit.send(message);
			}
	});

	/* -----------------------------------------------------------------------------
	// ThingSpeak.com Integration
	// https://www.npmjs.com/package/thingspeakclient
	----------------------------------------------------------------------------- */

	var channelId = 71891; // Weather channel
	var tsClient = require('thingspeakclient');
	var thingSpeakClient = new tsClient();
	thingSpeakClient.attachChannel(channelId, {
		writeKey:config.thingspeak.write_key,
		readKey:config.thingspeak.read_key,
		callback: function(message){
			console.log("Attached to channel: "+channelId);
		}
	});
	thingSpeakClient.updateChannel(channelId, {field3:"weather station online"}, function(err, resp) {
			if (!err && resp > 0) {
				console.log('thingSpeakClient updateChannel success. Entry number was: ' + resp);
			}else{
				console.log("thingSpeakClient updateChannel error: "+err);
			}
	});

	/* ---------------------------------------------------------------------------
	Publish ThingSpeak Messages
	--------------------------------------------------------------------------- */
	circuit.on('message', function(msg) {
		console.log("ThinkSpeak sending message from circuit: ");
		//console.log(util.inspect(msg, false, null));
		//console.log("circuit.on message and sending to pubnub channel id: "+channelId+ ", {field1: +"+msg.id +" field2: "+msg.weather.main.temp+"}");

		thingSpeakClient.updateChannel(channelId, {field1: 1, field2: 7}, function(err, resp) {
				if (!err && resp > 0) {
						console.log('update successfully. Entry number was: ' + resp);
				}
		});


	/* ---------------------------------------------------------------------------
	Listen for ThingSpeak Messages
	--------------------------------------------------------------------------- */
	thingSpeakClient.getChannelFeeds(channelId, function(query){
		console.log("ThingSpeak message from channel 71891: "+ query);
	});
});

/* -----------------------------------------------------------------------------
// MQTT Integration
// https://github.com/mqttjs/MQTT.js
----------------------------------------------------------------------------- */

var mqtt = require('mqtt');
var mqttClient = mqtt.connect(config.mqtt.broker_url);

mqttClient.on('connect', function () {
  mqttClient.subscribe('news');
  mqttClient.publish('news', 'Hello MQTT from the weather station!');

	circuit.on('message', function(msg) {
		console.log("MQTT sending message from circuit: ");
		console.log(JSON.stringify(msg));
		mqttClient.publish('news', 'weather station sending data');
		mqttClient.publish('news', JSON.stringify(msg)); // NOT SENDING MSG DATA FOR SOME REASON??
		console.log("MQTT message sent complete from circuit: ");
	});
});

mqttClient.on('message', function (topic, message) {
  // message is Buffer
  console.log(message.toString());
  mqttClient.end();
});
