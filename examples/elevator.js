// elevator.js

// This program will use an Adafruit motor shield v1 (http://www.adafruit.com/products/81) clone to power a small 5v motor and an ultrasonic sensor for positioning
// The ultrasonic sensor requires PingFirmata on the Arduino (http://johnny-five.io/api/proximity/#pingfirmata)


// Dependencies
  var five = require('johnny-five');
  var board = new five.Board();

  // Create an emitter object to receive commands from the server
  var events = require('events');
  var emitter = new events.EventEmitter();

  board.on("ready", function() {

  // Devices
    // Assign motorshield config to arduino board
    var configs = five.Motor.SHIELD_CONFIGS.ADAFRUIT_V1;
      //configs.M4.board = uno; // adds "uno" port as property of config with multi-board setups
      // Use for troubleshooting & analysis
      //console.log("configs");
      //console.log(util.inspect(configs, false, null));

    var elevatorMotor = new five.Motor(configs.M4);

    var elevatorProximity = new five.Proximity({
      controller: "HCSR04",
      pin: 2,
      freq: 50,
    });
 

  // PROVIDE EXTERNAL CONNECTIVITY 

      // Add devices to REPL (optional)

      this.repl.inject({
          elevatorMotor: elevatorMotor,
          elevatorToggle: elevatorToggle,
          elevatorStop: elevatorStop
      });

    // Receive the command from the server
      emitter.on("command", function(command){
        // Check command received and execute actions
         if (command === "elevator_up"){
            elevatorUp();
            return;
         }
         if (command === "elevator_down"){
            elevatorDown();
            return;
         }
         if (command === "elevator_stop"){
            elevatorStop();
            return;
         }
         if (command === "elevator_toggle"){
            elevatorToggle();
            return;
         }
    });

  // Do Something

    // Elevator
    var elevatorState = "stopped";
    var elevatorPosition;
      // Smoothing algorithm variables to average proximity data in real-time 
    var evNumReadings = 10;       // the number of readings per average
    var evReadings = [] ;           // the readings from the analog input
    var evReadIndex = 0;              // the index of the current reading
    var evTotal = 0;                  // the running total
    var evAverage = 0;                // the average  
    for (evThisReading = 0; evThisReading < evNumReadings; evThisReading++) {
      evReadings[evThisReading] = 0;  // initialize data
    }

    elevatorProximity.on("change", function() {
      // console.log("Elevator moving");
    });

    elevatorProximity.on("data", function() {
    // console.log(this.cm + "cm" + " avg " + evAverage + " state = " + elevatorState + ": position = " + elevatorPosition);  
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
});

// API for use in server.js 
    module.exports = emitter;

