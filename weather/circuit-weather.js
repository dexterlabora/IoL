// circuit-weather.js

var five = require("johnny-five");
var board = new five.Board();
var temporal = require("temporal");
//var patterns =require("./matrixpatterns.js");

//	Communicate with parent server
	process.send("Hello from the circuit!");
	process.on("message", function(message){
		console.log("circuit received message from server: ", message);
	});

board.on('ready', function(){
    console.log('five ready');

    // Devices
    var led = new five.Led(13);

    var matrix = new five.Led.Matrix({
    pins: {
        data: 12,
        clock: 10,
        cs: 11
      }
    });

    // Runtime Access
    this.repl.inject({
      led: led,
      matrix: matrix,
    });

    led.blink();

    // Logic

    process.on("message", function(message){

      // Weather Underground API data
      if(message.weather.tempc){
        console.log("weather temperature celcius: " + message.weather.tempc);
        matrix.brightness(10);
        matrix.draw(message.weather.tempc);
      }
    }); // end process.on()


});
