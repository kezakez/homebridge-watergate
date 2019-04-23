// platform functionality, creates instances of valves based on config
var valve = require("./valve");

module.exports = function(homebridge) {
  Accessory = homebridge.platformAccessory;
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  UUIDGen = homebridge.hap.uuid;
  homebridge.registerPlatform(
    "homebridge-watergate",
    "Watergate",
    Watergate,
    true
  );
};

function Watergate(log, config, api) {
  this.log = log;
  this.config = config;
  this.api = api;
  this.accessories = [];

  api.on(
    "didFinishLaunching",
    function() {
      console.log("finished loading");
      if (config.mqtt && config.mqtt.enabled) {
        const mqtt = require("./mqtt");
        const devices = mqtt.setupDevices(config.mqtt);
        devices.forEach(device => this.addAccessory(device.name, device));
      }
      if (config.gpio && config.gpio.enabled) {
        const gpio = require("./gpio");
        gpio.setup(config.mqtt);
      }
    }.bind(this)
  );
}

Watergate.prototype.addAccessory = function(accessoryName, device) {
  console.log("add accessory");
  console.log(this.accessories);
  var uuid = UUIDGen.generate(accessoryName);
  const existingAccessory = this.accessories.find(item => item.UUID === uuid);
  const accessory = existingAccessory || new Accessory(accessoryName, uuid);
  let valveService;
  if (!existingAccessory) {
    valveService = new Service.Valve(accessoryName);
    accessory.addService(valveService, accessoryName);
    this.accessories.push(accessory);
    this.api.registerPlatformAccessories("homebridge-watergate", "Watergate", [
      newAccessory
    ]);
  } else {
    // todo maybe creating an accessory has a default service set up for you to use
    valveService = accessory.services[1];
  }
  valve.bindValveService(valveService, device, this.log);
};

Watergate.prototype.configureAccessory = function(accessory) {
  this.accessories.push(accessory);
};
