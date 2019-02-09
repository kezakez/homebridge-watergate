var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-watergate", "Watergate", Watergate);
};

function Watergate(log, config) {
  this.log = log;
  this.name = config.name;
}
Watergate.prototype.getServices = function() {
  var plugin = this;
  plugin.log("creating watergate valve");

  var valveService = new Service.Valve(plugin.name);
  valveService.getCharacteristic(Characteristic.ValveType).updateValue(1);

  //var hw = require("./hardware.js");

  let startTime = null;
  valveService
    .getCharacteristic(Characteristic.Active)
    .on("set", function(value, callback) {
      plugin.log("Active -> " + value);
      if (value) {
        startTime = new Date();
        //   hw.on(3);
        valveService.setCharacteristic(Characteristic.InUse, 1);
        valveService.setCharacteristic(
          Characteristic.SetDuration,
          durationSeconds
        );
        //todo turn off after x seconds
      } else {
        startTime = null;
        //   hw.off(3);
        valveService.setCharacteristic(Characteristic.InUse, 0);
      }
      callback();
    })
    .on("get", function(callback) {
      callback(null, startTime !== null);
    });

  const secondsRemaining = () => {
    const now = new Date();
    const currentRunTime = (now - startTime) / 1000;
    const remaining = Math.round(durationSeconds - currentRunTime);
    console.log({ remaining });
    return remaining;
  };

  let durationSeconds = 300;
  valveService
    .addCharacteristic(Characteristic.SetDuration)
    .on("set", function(value, callback) {
      plugin.log("SetDuration " + value);
      durationSeconds = value;
      valveService.setCharacteristic(
        Characteristic.RemainingDuration,
        secondsRemaining()
      );

      callback();
    })
    .on("get", function(callback) {
      plugin.log("get SetDuration " + durationSeconds);
      callback(null, durationSeconds);
    });

  valveService
    .getCharacteristic(Characteristic.RemainingDuration)
    .on("set", function(value, callback) {
      plugin.log("Remaining -> " + value);
      callback();
    })
    .on("get", function(callback) {
      const remaining = secondsRemaining();
      plugin.log("get remaining " + remaining);
      callback(null, remaining);
    });

  return [valveService];
};
