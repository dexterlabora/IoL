//disco.js

var five = require("johnny-five");
var board = new five.Board();


//Arduino board connection

board.on("ready", function() {	   

    // Disco Light
    var discoLed = new five.Led(28); 

    // Add devices to REPL (optional)
    this.repl.inject({
    discoLed: discoLed
     });

});

