var Service, Characteristic;

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-watergate", "Watergate", Watergate);
};

const secondsRemaining = (currentStartTime, durationSeconds) => {
  const now = new Date();
  const currentRunTime = (now - currentStartTime) / 1000;
  const remaining = Math.round(durationSeconds - currentRunTime);
  console.log({ currentStartTime });
  console.log({ remaining });
  if (remaining > 0) {
    return remaining;
  }
  return 0;
};

let timeoutHandle = null;
let startTime = null;
let durationSeconds = 300;

const turnOff = (valveService, client) => {
  clearOffTimer();
  startTime = null;
  client.turnOff();
  valveService.setCharacteristic(Characteristic.InUse, 0);
};

const clearOffTimer = () => {
  if (timeoutHandle) {
    console.log("clearing timeout");
    clearTimeout(timeoutHandle);
  }
};

const updateOffTimer = (valveService, turnOffSeconds) => {
  clearOffTimer();
  console.log(`turning off in ${turnOffSeconds} seconds`);
  timeoutHandle = setTimeout(() => {
    console.log("turning off");
    valveService.setCharacteristic(Characteristic.Active, 0);
    turnOff(valveService);
  }, turnOffSeconds * 1000);
};

const turnOn = (valveService, durationSeconds, client) => {
  startTime = new Date();
  client.turnOn();
  valveService.setCharacteristic(Characteristic.InUse, 1);
  valveService.setCharacteristic(Characteristic.SetDuration, durationSeconds);

  const remainingSeconds = secondsRemaining(startTime, durationSeconds);

  updateOffTimer(valveService, remainingSeconds);
};

function Watergate(log, config) {
  this.log = log;
  this.name = config.name;
  this.config = config;

  console.log({ config });

  if (config.mqtt) {
    this.client = require("./mqtt");
    this.client.setup(config.mqtt);
  } else {
    // todo use platform and be abel to have both
    this.client = require("./gpio");
    this.client.setup(config.gpio);
    console.log(this.client);
  }
}
Watergate.prototype.getServices = function() {
  var plugin = this;
  plugin.log("creating watergate valve");

  var valveService = new Service.Valve(plugin.name);
  valveService.getCharacteristic(Characteristic.ValveType).updateValue(1);

  if (plugin.config.mqtt) {
    plugin.client.on("statuschanged", status => {
      valveService
        .getCharacteristic(Characteristic.Active)
        .updateValue(status ? 1 : 0);
      valveService.setCharacteristic(Characteristic.InUse, status ? 1 : 0);
    });
  }

  valveService
    .getCharacteristic(Characteristic.Active)
    .on("set", function(value, callback) {
      plugin.log("set Active " + value);
      if (value) {
        console.log(plugin.client);
        turnOn(valveService, durationSeconds, plugin.client);
      } else {
        turnOff(valveService, plugin.client);
      }
      callback();
    })
    .on("get", function(callback) {
      const active = startTime !== null;
      plugin.log("get Active " + active);
      callback(null, active);
    });

  valveService
    .addCharacteristic(Characteristic.SetDuration)
    .on("set", function(value, callback) {
      plugin.log("set SetDuration " + value);
      durationSeconds = value;
      valveService.setCharacteristic(
        Characteristic.RemainingDuration,
        secondsRemaining(startTime, durationSeconds)
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
      plugin.log("set Remaining " + value);
      updateOffTimer(valveService, value);
      callback();
    })
    .on("get", function(callback) {
      const remaining = secondsRemaining(startTime, durationSeconds);
      plugin.log("get Remaining " + remaining);
      callback(null, remaining);
    });

  return [valveService];
};
