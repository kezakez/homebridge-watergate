// mqtt related functionality

var client = require("./mqttclient.js");

exports.setupDevices = function(mqttConfig) {
  const brokerHost = mqttConfig.broker || "localhost";
  if (brokerHost === "localhost") {
    var broker = require("./mqttbroker.js");
    console.log("setting up mqtt broker");
    broker.setup(mqttConfig.username, mqttConfig.password);
  }
  console.log("setting up mqtt client");
  client.setup(
    mqttConfig.broker,
    "sonoff",
    mqttConfig.username,
    mqttConfig.password
  );

  return mqttConfig.devices.map(device => {
    if (device.enabled) {
      return new MqttDevice(device.name, device.topic);
    }
  });
};

class MqttDevice {
  constructor(name, topic) {
    this.name = name;
    this.topic = topic;
  }

  turnOn() {
    console.log("sending mqtt turn on");
    client.turnOn();
  }

  turnOff() {
    console.log("sending mqtt turn off");
    client.turnOff();
  }

  on(event, callback) {
    //todo this needs to be moved
    plugin.client.on("statuschanged", status => {
      valveService
        .getCharacteristic(Characteristic.Active)
        .updateValue(status ? 1 : 0);
      valveService.setCharacteristic(Characteristic.InUse, status ? 1 : 0);
    });
  }

  close() {
    client.end();
  }
}
