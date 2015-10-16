var five = require("johnny-five");
var board = new five.Board();

board.on("ready", function() {
  var led = new five.Led(13);

  // This will grant access to the led instance
  // from within the REPL that's created when
  // running this program.
  this.repl.inject({
    led: led
  });

  led.blink();
  // Digital Tmperature
  /*
  var temperature = new five.Temperature({
    controller: "DS18B20",
    pin: 3
  });
  */

  // Create an analog Temperature object:
  var temperature = new five.Temperature({
    pin: "A0",
    toCelsius: function(raw) { // optional
      return (raw / sensivity) + offset;
    }
  });

  temperature.on("change", function() {
    console.log("celsius: %d", this.C);
    console.log("fahrenheit: %d", this.F);
    console.log("kelvin: %d", this.K);
  });
});
