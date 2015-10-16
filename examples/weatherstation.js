'use strict';

var VirtualSerialPort = require('udp-serial').SerialPort;
var firmata = require('firmata');
var five = require("johnny-five");

//create the udp serialport and specify the host and port to connect to
var sp = new VirtualSerialPort({
  host: '192.168.0.17',
  type: 'udp4',
  port: 1025
});

//use the serial port to send a command to a remote firmata(arduino) device
var io = new firmata.Board(sp);
console.log("Waiting on IO");
io.once('ready', function(){
    console.log('IO Ready');
    io.isReady = true;

    var board = new five.Board({io: io, repl: true});

    board.on('ready', function(){
        console.log('five ready');

        // Devices
        var led = new five.Led(13);

        // Create an Analog Temperature object:
        var temperature = new five.Temperature({
            pin: "A0",
            toCelsius: function(raw) {
              var Temp;
              Temp = Math.log(10000.0*((1024.0/raw-1))); 
              Temp = 1 / (0.001129148 + (0.000234125 + (0.0000000876741 * Temp * Temp ))* Temp );
              Temp = Temp - 273.15;            // Convert Kelvin to Celcius
               //Temp = (Temp * 9.0)/ 5.0 + 32.0; // Convert Celcius to Fahrenheit
               return Temp;
              }
          });




        // Weather Station Logic



        // Collect Temperature Data
        temperature.on("change", function() {
          // Blink LED to indicate incoming temperature data
          led.blink();
          console.log("celsius: %d", this.C);
          console.log("fahrenheit: %d", this.F);
          console.log("kelvin: %d", this.K);
        });
    });
});
