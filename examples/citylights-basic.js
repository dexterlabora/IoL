var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  	var cityLed = new five.Led(8); //general city lighting

   	// Add devices to REPL (optional)
	this.repl.inject({
		cityLed: cityLed
	});

  	console.log("Turned on City Lights!");
  	cityLed.on();
  
});
