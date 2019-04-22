// gpio related functionality

var Gpio = require("onoff").Gpio;

exports.setup = function(config) {};

exports.turnOn = function(gpioNumber) {
  var pin = new Gpio(gpioNumber, "out");
  pin.writeSync(1);
};

exports.turnOff = function(gpioNumber) {
  var pin = new Gpio(gpioNumber, "out");
  pin.writeSync(0);
};

exports.close = function() {
  for (var i = 0; i < pins.length; i++) {
    var pin = new Gpio(pins[i], "out");
    pin.unexport();
  }
};
