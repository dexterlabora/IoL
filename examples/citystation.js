// citystation.js

// Dependencies
	var five = require('johnny-five');
	var raspi = require("raspi-io");
	var board = new five.Board({
  		io: new raspi()
	});


	// Lego IR lirc
	var sys = require('sys');
	var exec = require('child_process').exec;

// Global Functions

	// Linux access to infrared transmitter daemon lirc
		// Code concept and prerequisites found here: https://github.com/dspinellis/lego-power-scratch
	function pfir(command){
        exec('irsend SEND_ONCE LEGO_Single_Output ' + command, function(error, stdout, stderr){ 
        	if(error)
          		console.log("Error sending command: " + command);
        });
	}

// Arduino board connection
board.on("ready", function() {
	// IR Transmit via LIRC on raspi GPIO 22
	// IR Receive via LIRC on raspi GPIO 23

    // City Station Components
	var cityStationIRSensor = new five.Sensor.Digital('GPIO6');

    // City Station Routine
    var stationActive = false; // initialize state

    cityStationIRSensor.on('change', function(){
    	console.log("IR Sensor triggered");

    	// If train is not already detected, begin routine. 
    	if (stationActive == false){
    		console.log("Train has arrived and stopping");
    		stationActive = true;
    		
    		// Stop Red Train (delay to align passenger coach)
			setTimeout(function(){
				pfir('1R_BRAKE');
			}, 300);
			
			// After 5 seconds start train
			setTimeout(function(){
				console.log("Moving forward");
				pfir('1R_4');
			}, 5000);

			// Resume sensor data after 10 seconds.
			setTimeout(function(){
				console.log("Train has cleared station");
				stationActive = false;
			}, 10000);
    	}	
	});
});
