// circuit-weather.js

/*****************
// Utilities
******************/

// used for debugging purposes
var util = require('util');
  //Example: console.log(util.inspect(configs, false, null));

// Timing
var temporal = require("temporal");

// HTTP request
var request = require("request");

//	Communicate with parent server
process.send("Hello from the weather circuit!");

/*
process.on("message", function(message){
	console.log("id: server", message);
});
*/

/********************
// OpenWeatherMap API
********************/
//var  appid = 'ada3e1a80c2b74631f4be3499369198b';

var weather;
// update weather every minute
function updateWeather(){
	console.log("updating weather");
	request("http://api.openweathermap.org/data/2.5/weather?q=london&units=metric&id=524901&APPID=ada3e1a80c2b74631f4be3499369198b", function(error, response, body) {
		weather = JSON.parse(body);
	});
}
updateWeather();

// update weather every 60 seconds
setInterval(function() {
	console.log("Weather data from OpenWeatherMap.org (local API call)");
	updateWeather();

	// send weather data to console
	console.log("OpenWeatherMap Data: weather");
	console.log(util.inspect(weather, false, null));

	// send weather data to server
	/*
	process.send({
		'data':{
			'id':"weather_station",
			'message':weather.main.temp
		}
	});
	*/

	process.send(weather);

},60000);


/***********************
Weather Station Hardware
***********************/
var five = require("johnny-five");
//var patterns =require("./matrixpatterns.js");

// Define Johnny-Five Boards
var ports = [
  { id: "nano", port: "/dev/ttyUSB1" }
];


var board = new five.Boards(ports).on("ready", function(){
  nano = this[0];


  console.log('five ready');

  // Devices
  var led = new five.Led({
		pin: 13,
		board: nano
  });

  var matrix = new five.Led.Matrix({
	  pins: {
	      data: 12,
	      clock: 10,
	      cs: 11
	    },
		board: nano
  });

	// Runtime Access
	this.repl.inject({
	  led: led,
	  matrix: matrix,
	});

	led.blink();

	/*********************
	// Logic
	/*********************/

	// update LED matrix screen
	matrix.brightness(5);

	// loop every 3 seconds
	setInterval(function(){
    console.log("City "+weather.name);
    console.log("Temperature in Celcius "+weather.main.temp);
    matrix.draw(weather.main.temp);
		//matrix.draw(8);
		setTimeout(function(){
			console.log("draw clock");
			matrix.draw(five.Led.Matrix.CHARS.clock);
		},3000);
	}, 6000);

}); //end board
