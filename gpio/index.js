// gpio related functionality

var Gpio = require("onoff").Gpio;

exports.setupDevices = function (gpioConfig) {
  return gpioConfig.pins.map(pin => {
    if (pin.enabled) {
      return new GpioDevice(pin.name, pin.pin);
    }
  }).filter(device => !!device);
};

exports.close = function () {
  //todo clean up
  for (var i = 0; i < pins.length; i++) {
    var pin = new Gpio(pins[i], "out");
    pin.unexport();
  }
};

class GpioDevice {
  constructor(name, pin) {
    this.name = name;
    this.pin = pin;
  }

  turnOn() {
    try {
      var pin = new Gpio(this.pin, "out");
      pin.writeSync(1);
    } catch (error) {
      console.log('unable to turn on', error.message)
    }
  }

  turnOff() {
    try {
      var pin = new Gpio(this.pin, "out");
      pin.writeSync(0);
    } catch (error) {
      console.log('unable to turn off', error.message)
    }
  }

  on(event, callback) {
    //no op
  }

  close() {
    //no op
  }
}