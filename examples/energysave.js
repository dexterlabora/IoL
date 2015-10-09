// energysave.js

// Dependencies 
var five = require("johnny-five");
var board = new five.Board();

// Arduino board connection
board.on("ready", function() {

    // Motion sensor components
    var motionSensor = new five.Sensor.Digital({
    	pin: 52,
    });
    
    var motionLed = new five.Led({
    	pin: 42,
    });

	// Disco Light
    var discoLed = new five.Led({
    	pin: 28,
    }); 

	// City Lights
	var cityLed = new five.Led({
		pin: 8,
	}); 

	// Sleepmode logic
	var sleepMode;
	motionSensor.on('change', function(){
	  motionLed.on();
	  setTimeout(function(){
	      motionLed.off();
	  },2000);

	  // Wake up these
	  cityLed.on();
	  discoLed.on();

	  // Reset sleep timer
	  clearTimeout(sleepMode);
	  console.log("sleep timer reset");  

	  // Set sleep timer        
	  sleepMode = setTimeout(function() {
	      console.log("going to sleep");

	      // Sleep these
	      cityLed.off();  
	      discoLed.off();
	    }, 1000*60*5); // Sleep in 5 minutes
	});
});