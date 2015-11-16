// circuit-weather.js

var five = require("johnny-five");
var temporal = require("temporal");
//var patterns =require("./matrixpatterns.js");

//	Communicate with parent server
	process.send("Hello from the circuit!");
	process.on("message", function(message){
		console.log("circuit received message from server: ", message);
	});

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

    // Logic

		process.on("message", function(msg){


      // Weather Underground API data

      if( typeof msg.weather !== 'undefined'){
				var weather = msg.weather;
        console.log("weather temperature celcius: " + weather.tempc);
        matrix.brightness(10);
        matrix.draw(weather.tempc);
      }


    }); // end process.on()


});
