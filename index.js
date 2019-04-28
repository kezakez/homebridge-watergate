// platform functionality, creates instances of valves based on config
var valve = require("./valve");

module.exports = function (homebridge) {
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
    function () {
      console.log("finished loading");
      let devices = [];
      if (config.mqtt && config.mqtt.enabled) {
        const mqtt = require("./mqtt");
        devices.push(...mqtt.setupDevices(config.mqtt));
      }
      if (config.gpio && config.gpio.enabled) {
        const gpio = require("./gpio");
        devices.push(...gpio.setupDevices(config.gpio));
      }
      devices.forEach(device => {
        console.log(device)
        this.addAccessory(device)
      });
    }.bind(this)
  );
}

Watergate.prototype.addAccessory = function (device) {
  console.log("add accessory");
  console.log({ device });
  var uuid = UUIDGen.generate(device.name);
  const existingAccessory = this.accessories.find(item => item.UUID === uuid);
  const accessory = existingAccessory || new Accessory(device.name, uuid);
  let valveService;
  if (!existingAccessory) {
    valveService = new Service.Valve(device.name);
    accessory.addService(valveService, device.name);
    this.accessories.push(accessory);
    this.api.registerPlatformAccessories("homebridge-watergate", "Watergate", [
      accessory
    ]);
  } else {
    // todo maybe creating an accessory has a default service set up for you to use
    valveService = accessory.services[1];
  }
  valve.bindValveService(valveService, device, this.log);
};

Watergate.prototype.configureAccessory = function (accessory) {
  // todo remove accessories no longer in the config
  this.accessories.push(accessory);
};
