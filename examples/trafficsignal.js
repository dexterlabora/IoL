//trafficsignal.js

var five = require("johnny-five");
var board = new five.Board();


//Arduino board connection

board.on("ready", function() {

	// Traffic Signal LEDs
    var trafficSignalLedRG = new five.Led(49); //Signal Red & Green
    var trafficSignalLedY = new five.Led(50); //Signal Yellow
    var trafficSignalLedGR = new five.Led(51); //Signal Green & Red

    var trafficSignalState = 0; // Initialize Signal State

    function trafficSignal(){
            if (trafficSignalState == 0){    // Red
                console.log("traffic crossing RG");
                trafficSignalLedRG.on();
                trafficSignalLedY.off();
                trafficSignalLedGR.off();
                trafficSignalState = 1;
                setTimeout(trafficSignal,6000); 
            } else if (trafficSignalState == 1){ // Yellow
                console.log("traffic crossing Y");
                trafficSignalLedRG.off();
                trafficSignalLedY.on();
                trafficSignalLedGR.off();
                trafficSignalState = 2;
                setTimeout(trafficSignal,2000); 
            } else if (trafficSignalState == 2){ // Green
                console.log("traffic crossing GR");
                trafficSignalLedRG.off();
                trafficSignalLedY.off();
                trafficSignalLedGR.on();
                trafficSignalState = 3; 
                setTimeout(trafficSignal,6000);
            } else if (trafficSignalState == 3){ // Yellow
                console.log("traffic crossing Y");
                trafficSignalLedRG.off();
                trafficSignalLedY.on();
                trafficSignalLedGR.off();
                trafficSignalState = 0;
                setTimeout(trafficSignal,2000); 
            }
    }
    trafficSignal(); // Start Traffic Signal

});
 
