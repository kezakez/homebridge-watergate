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
        devices.forEach(device => this.addAccessory(device.name));
      }
      if (config.gpio && config.gpio.enabled) {
        const gpio = require("./gpio");
        gpio.setup(config.mqtt);
      }
    }.bind(this)
  );
}

Watergate.prototype.addAccessory = function(accessoryName) {
  console.log("add accessory");
  console.log(this.accessories);
  var uuid = UUIDGen.generate(accessoryName);
  if (this.accessories.find(item => item.UUID === uuid)) {
    console.log("not adding already set up accessory", accessoryName);
    return;
  }

  var newAccessory = new Accessory(accessoryName, uuid);
  const valveService = new Service.Valve(accessoryName);
  const service = valve.bindValveService(valveService, this.log);
  newAccessory.addService(service, accessoryName);

  this.accessories.push(newAccessory);
  this.api.registerPlatformAccessories("homebridge-watergate", "Watergate", [
    newAccessory
  ]);
};

Watergate.prototype.configureAccessory = function(accessory) {
  this.log("config accessory", accessory);
  valve.bindValveService(accessory.services[1], this.log);

  this.accessories.push(accessory);
};
