var Gpio = require("onoff").Gpio;

var pins = [14, 15, 18, 23, 24, 25, 8, 7];

exports.setup = function(config) {
  //todo get use and pins working for multiple when platform is going
  relay = config.use;
};

exports.turnOn = function() {
  var pin = new Gpio(pins[relay - 1], "out");
  pin.writeSync(1);
};

exports.turnOff = function() {
  var pin = new Gpio(pins[relay - 1], "out");
  pin.writeSync(0);
};

exports.close = function() {
  for (var i = 0; i < pins.length; i++) {
    var pin = new Gpio(pins[i], "out");
    pin.unexport();
  }
};
