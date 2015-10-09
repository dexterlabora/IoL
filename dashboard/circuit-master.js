// combo2.js
	// This program uses multiple microcontrollers in the same app


// ~~~~ CIRCUIT ~~~~~~~
// Includes
	var five = require('johnny-five');
	var Raspi = require("raspi-io");

	// Lego IR lidr
	var sys = require('sys');
	var exec = require('child_process').exec;

	// used for debugging purposes
	var util = require('util');
		//Example: console.log(util.inspect(configs, false, null));

//	Communicate with parent server
	process.send("Hello from the circuit!");
	process.on("message", function(message){
		console.log("circuit received message from server: ", message);
	});


// Global Functions

	// Linux access to infrared transmitter daemon lidr
		// Code concept from: https://github.com/dspinellis/lego-power-scratch
	function pfir(command){
          exec('irsend SEND_ONCE LEGO_Single_Output ' + command, function(error, stdout, stderr){ 
        if(error)
          console.log("Error sending command: " + command);
     //   else   
     //     console.log("Successfully sent command: " + command);
        });
	}



// Define Johnny-Five Boards
	var ports = [
	  { id: "mega", port: "/dev/ttyACM0" },
	  { id: "motor", port: "/dev/ttyUSB0" },
	  { id: "rpi", io: new Raspi()}
	];

	var board = new five.Boards(ports).on("ready", function(){
	    mega = this[0];
	    motor = this[1];
	    rpi = this[2];
  
    // Devices

        // Disco Light
        var discoLed = new five.Led({
            pin: 28,
            board: mega
        }); 

        // City Lights
        var cityLed = new five.Led({
            pin: 8,
            board: mega
        }); 

        // test LED
        var led = new five.Led({
            pin: 13,
            board: mega
        });
        
        // Track Switches
        var trackSwitchLedA = new five.Led({
            pin: 26,
            board: mega
        });

        var trackSwitchLedB = new five.Led({
            pin: 27,
            board: mega
        });

        var trackSwitchServo = new five.Servo({
            pin: 2,
            board: mega
        });

        var trackSwitch2Servo = new five.Servo({
            pin: 3,
            board: mega
        });

        var trackSwitchButton = new five.Button({
            pin: 45,
            board: mega
        });
        
        // Traffic Signal
        var trafficSignalLedRG = new five.Led({
            pin: 49,
            board: mega
        }); 

        var trafficSignalLedY = new five.Led({
            pin: 50,
            board: mega
        });

        var trafficSignalLedGR = new five.Led({
            pin: 51,
            board: mega
        });

        // Track Road Crossing
        //crossing light 1
        var crossingLed1 = new five.Led({
            pin: 22,
            board: mega
        }); 
        //crossing light 2
        var crossingLed2 = new five.Led({
            pin: 23,
            board: mega
        }); 
        // crossing arm
        var crossingServo = new five.Servo({
            pin: 6,
            rate: 0.05,
            board: mega
        }); 
        var crossingSensor = new five.Sensor.Digital({ //crossing sensor 
            pin: 53,
            freq: 150, // how often to read the sensor in milliseconds
            board: mega
         });

        // City Station
        var cityStationIRSensor = new five.Sensor.Digital({
        	pin: 'GPIO6',
        	board: rpi
        });
        
        // Motion Sensor
        var motionSensor = new five.Sensor.Digital({
            pin: 52,
            board: mega
        });
        
        var motionLed = new five.Led({
            pin: 42,
            board: mega
        });
    
        // Elevator
            // Assign motorshield config to arduino board
        var configs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V1;
        configs.M4.board = motor; // adds "motor" port as property of config
            // Use for troubleshooting & analysis
            //console.log("configs");
            //console.log(util.inspect(configs, false, null));

        var elevatorMotor = new five.Motor(configs.M4);


        var elevatorProximity = new five.Proximity({
            controller: "HCSR04",
            pin: 2,
            freq: 50,
            board: motor
        });
  
    // ***** REPL COMMAND LINE *****
    // Add devices to REPL (optional)
    this.repl.inject({
        crossingServo: crossingServo,
        crossingLed1: crossingLed1,
        crossingLed2: crossingLed2,
        trackSwitchLedA: trackSwitchLedA,
        trackSwitchLedB: trackSwitchLedB,
        crossingSensor: crossingSensor,
        trackSwitchServo: trackSwitchServo,
        trackSwitch2Servo: trackSwitch2Servo,
        trackSwitchButton: trackSwitchButton,
        trafficSignal: trafficSignal,
        trafficSignalLedRG: trafficSignalLedRG,
        trafficSignalLedY: trafficSignalLedY,
        trafficSignalLedGR: trafficSignalLedGR,
        motionLed: motionLed,
        motionSensor: motionSensor,
        cityLed: cityLed,
        elevatorMotor: elevatorMotor,  // range: 30 - 100
        elevatorDown: elevatorDown,
        elevatorUp: elevatorUp,
        elevatorToggle: elevatorToggle,
        elevatorStop: elevatorStop,
        trackSwitch: trackSwitch, //toggles
        trackSwitch2: trackSwitch2, //toggles
        trackSwitchServo: trackSwitchServo, // range: 90 - 130
        discoParty: discoParty,
        pfir_1R_4: pfir_1R_4,
        train_1R_forward: train_1R_forward,
        pfir_1R_brake: pfir_1R_brake
     });

// Receive the command from the server
	process.on('message', function(msg){
		var command = msg.command;
	    console.log("command received: ", command);
	     // Check command received and execute actions
	     if (command === "disco"){
	        discoParty();
	     }
	     if (command === "elevator_up"){
	        elevatorUp();
	     }
	     if (command === "elevator_down"){
	        elevatorDown();
	     }
	     if (command === "elevator_stop"){
	        elevatorStop();
	     }
	     if (command === "elevator_toggle"){
	        elevatorToggle();
	     }
	     if (command === "lights_on"){
	        cityLed.on();
	     }
	     if (command === "lights_off"){
	        cityLed.off();
	     }
	     if (command === "track_straight"){
	        trackSwitch("straight");
	     }
	     if (command === "track_turn"){
	        trackSwitch("turn");
	     }  
	     if (command === "pfir_1B_M5"){
	        pfir_1B_M5();
	     }
	     if (command === "pfir_1B_brake"){
	        pfir_1B_brake();
	     }
	     if (command === "pfir_1R_4"){
	        pfir_1R_4();
	     }
	     if (command === "pfir_1R_brake"){
	        pfir_1R_brake();
	     }
	     if (command === "pfir_1R_forward"){
	        pfir_1R_4();
	     }
	     if (command === "train_crossing"){   
	        crossingActivate(); 
	        crossingDelayed(); 
	     }
	});
    

    // DO INTERESTING STUFF HERE

        // Track Switch
        trackSwitchButton.on("down", function(){
            console.log("trackSwitchButton pressed");
            trackSwitch();
        });    

        // Disco 
        function discoParty(){
            console.log("Let's start the party!");
            discoLed.on();
            setTimeout(function(){
                console.log("Party's over! you don't have to go home, but you can't stay here.")
                discoLed.off()
            },5000);
        }

        // Elevator
        var elevatorState = "stopped";
        var elevatorPosition;
            //Smoothing algorithm variables to average proximity data in real-time 
        var evNumReadings = 10;         // the number of readings per average
        var evReadings = [] ;           // the readings from the analog input
        var evReadIndex = 0;            // the index of the current reading
        var evTotal = 0;                // the running total
        var evAverage = 0;              // the average  
        for (evThisReading = 0; evThisReading < evNumReadings; evThisReading++) {
            evReadings[evThisReading] = 0;  // initialize data
        }

        elevatorProximity.on("change", function() {
            // console.log("Elevator moving");
        });



        elevatorProximity.on("data", function() {
            //console.log(this.cm + "cm" + " avg " + evAverage + " state = " + elevatorState + ": position = " + elevatorPosition); 
            
            //process.send("message",{"evData": this.cm});

            // Smoothing sensor data
            // subtract the last reading:
            evTotal = evTotal - evReadings[evReadIndex];
            // read from the sensor:
            evReadings[evReadIndex] = this.cm;
            // add the reading to the total:
            evTotal = evTotal + evReadings[evReadIndex];
            // advance to the next position in the array:
            evReadIndex = evReadIndex + 1;
            // if we're at the end of the array...
            if (evReadIndex >= evNumReadings) {
            // ...wrap around to the beginning:
            evReadIndex = 0;
            }
            // calculate the average:
            evAverage = evTotal / evNumReadings;

            // stop elevator automatically
            if (elevatorState != "stopped"){
                // bottom distance in cm and allow elevator to move in correct direction
                if (evAverage < 4.75 && elevatorState != "moving-up"){
                    console.log("elevator stopping");
                    elevatorStop();
                    elevatorPosition = "bottom";
                // top distance in cm
                }else if (evAverage > 19.85 && elevatorState != "moving-down"){
                    console.log("elevator stopping");
                    elevatorStop();
                    elevatorPosition = "top";
                }else{
                    elevatorPosition = "middle";
                }   
            }
        });

        function elevatorUp(){
            if (elevatorPosition != "top"){
                console.log("Elevator going up!");
                elevatorState = "moving-up";
                elevatorMotor.forward(120);
            }else{
                console.log("Elevator is already at the top");
            }
        }

        function elevatorDown(){
            if (elevatorPosition != "bottom"){
                console.log("Elevator going down!");
                elevatorState = "moving-down";
                elevatorMotor.reverse(90);
            }else{
                console.log("Elevator is already at the bottom");
            }
        }

        function elevatorStop(){
            console.log("Elevator Stopped");
            elevatorState = "stopped";
            elevatorMotor.brake();
        }

        function elevatorToggle(){
            console.log("Elevator Toggled");
            if (elevatorPosition == "bottom"){
                elevatorUp();
            }else{
                elevatorDown();
            }
        }

        // Turn on Disco Lights
        discoLed.on();

        // Turn on Testing LED
        //led.blink();

        // Turn on City Lights
        cityLed.on();

        // City Station Routine
        var stationActive = false; // initialize state

        cityStationIRSensor.on('change', function(){
            console.log("IR Sensor triggered");
            console.log("CityStation is active? ",stationActive);

            // If train is not already detected, begin routine. 
            if (stationActive == false){
                console.log("Train has arrived and stopping");
                stationActive = true;
                
                // Stop Red Train (delay to align passenger coach)
                setTimeout(function(){
                	console.log("Stopping at station and align coach");
                    pfir_1R_brake();
                }, 300);
                
                // After 5 seconds start train
                setTimeout(function(){
                    console.log("Moving forward");
                    train_1R_forward();
                }, 5000);

                // Resume sensor data after 10 seconds.
                setTimeout(function(){
                    console.log("Train has cleared station");
                    stationActive = false;
                    console.log("CityStation is active? ",stationActive);
                }, 10000);
            }   


        });

        // Track Switch with Lights
        var trackSwitchState = "straight";
        function trackSwitch(trackSwitchState){
            if (trackSwitchState == "straight"){
              console.log("track switched: Straight");
              trackSwitchLedA.on();
              trackSwitchLedB.off();
              trackSwitchServo.to(90);
              trackSwitchState = "straight";
            } else {
              console.log("track switched: Turn");
              trackSwitchLedA.off();
              trackSwitchLedB.on();
              trackSwitchServo.to(130);
              trackSwitchState = "turn";
            }
        }

        // Track Switch 2
        var trackSwitch2State = "straight";
        function trackSwitch2(){
            if (trackSwitch2State != "straight"){
              console.log("track switched: Straight");
              trackSwitch2Servo.to(90);
              trackSwitch2State = "straight";
            } else {
              console.log("track switched: Turn");
              trackSwitch2Servo.to(120);
              trackSwitch2State = "turn";
            }
        }

        // Traffic Signal Logic

        var trafficSignalState = 0;
        function trafficSignal(){
        		process.send({'trafficSignalState':trafficSignalState});
                if (trafficSignalState == 0){    // red
                    //console.log("traffic crossing RG");
                    trafficSignalLedRG.on();
                    trafficSignalLedY.off();
                    trafficSignalLedGR.off();
                    trafficSignalState = 1;
                    setTimeout(trafficSignal,6000); 
                } else if (trafficSignalState == 1){ // yellow
                    //console.log("traffic crossing Y");
                    trafficSignalLedRG.off();
                    trafficSignalLedY.on();
                    trafficSignalLedGR.off();
                    trafficSignalState = 2;
                    setTimeout(trafficSignal,2000); 
                } else if (trafficSignalState == 2){ // green
                    //console.log("traffic crossing GR");
                    trafficSignalLedRG.off();
                    trafficSignalLedY.off();
                    trafficSignalLedGR.on();
                    trafficSignalState = 3; 
                    setTimeout(trafficSignal,6000);
                } else if (trafficSignalState == 3){ // yellow
                    //console.log("traffic crossing Y");
                    trafficSignalLedRG.off();
                    trafficSignalLedY.on();
                    trafficSignalLedGR.off();
                    trafficSignalState = 0;
                    setTimeout(trafficSignal,2000); 
                }
        }
        trafficSignal();

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

        // Sleep Mode Logic
        var sleepMode;
        motionSensor.on('change', function(){
          motionLed.on();
          setTimeout(function(){
              motionLed.off();
          },2000);

          // Wake up these
          cityLed.on();
          discoLed.on();
          clearTimeout(sleepMode);
          console.log("sleep timer reset");          
          sleepMode = setTimeout(function() {
              console.log("going to sleep");

              // sleep these
              cityLed.off();  
              discoLed.off();
            }, 1000*60*5);
        });

        // Power Functions Ir
          function pfir_1B_M5(){
          console.log("pfir_1B_M5");
          pfir("1B_M5");
          }

          function pfir_1B_brake(){
          	  console.log("pfir_1B_brake");
              pfir("1B_BRAKE");
          }

          function pfir_1R_4(){
              console.log("pfir_1R_4");
              pfir("1R_5");
          }

          function pfir_1R_brake(){
              console.log("pfir_1R_brake");
              pfir("1R_BRAKE");
          }
          function train_1R_forward(){
          		pfir_1R_4(); // Setting normal train speed
          }

	}); // END new five.Boards(ports).on("ready", function(){


