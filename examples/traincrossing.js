// traincrossing.js

// Dependencies 
var five = require("johnny-five");
var board = new five.Board();

// Arduino board connection
board.on("ready", function() {

    // Train Crossing Components
    var crossingLed1 = new five.Led(22); // Crossing Light 1
    var crossingLed2 = new five.Led(23); // Crossing Light 2
    var crossingServo = new five.Servo(6); // Crossing Arm

    var crossingSensor = new five.Sensor.Digital({ // Crossing Sensor 
        pin: 53,
        freq: 150 // How often to read the sensor in milliseconds
     });


	// Add devices to REPL (optional)
    this.repl.inject({
        crossingServo: crossingServo,
        crossingLed1: crossingLed1,
        crossingLed2: crossingLed2
    });


    // Train Crossing State Variables
    var crossingDelay; // Used to delay crossing deactivation
    var crossingActive = false;

    // Train Crossing Sensor
    crossingSensor.on("change", function() {
        console.log('crossingSensor raw: ' + this.value );      
         if (this.value == 0){   // Inverted sensor, where 0 equals detection
            if (!crossingActive){ // Detect if the crossing is already active
               crossingActivate(); // Activate Crossing 
            }else{
               crossingDelayed(); // Delay Deactivation 
            }
        }
    });


    // Activate Crossing Arm and Lights
    function crossingActivate(){
        console.log("crossingActivate()");
        crossingActive = true;
        // Lights
        crossingLed1.blink(500);
        // Delay second light for alternating effect
        setTimeout(function() {
            crossingLed2.blink(500); // blink frequency in milliseconds
            }, 500); // delay in milliseconds
        // Servo Arm
        crossingServo.to(70); // Adjust this servo angle as needed
        crossingDelay = setTimeout(function(){ // Assign the timeout to a variable so we can clear it later if needed
        	crossingDeactivate();
    		},3000);    // Delay time in milliseconds
    }

    // Deactivate Crossing
    function crossingDeactivate(){
        console.log("crossingDeactivate()");
        crossingActive = false;
        crossingLed1.stop().off(); // Stop the blinking effect
        crossingLed2.stop().off();
        crossingServo.to(150); // Adjust this servo angle as needed
    }

    // Delay deactivation because the train is still passing.
    function crossingDelayed(){
    	console.log("crossingDelayed()");
        clearTimeout(crossingDelay); // Reset delay timer (or the crossing goes crazy!)
        crossingDelay = setTimeout(function(){    
            crossingDeactivate(); // Deactivate crossing after delay time
        },3000);    // Delay time in milliseconds
    }

});