var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var cityLed = new five.Led(8); //general city lighting

  cityLed.on();
  
});
