// mqtt related functionality

var client = require("./mqttclient.js");

exports.setupDevices = function(mqttConfig) {
  const brokerHost = mqttConfig.broker || "localhost";
  if (brokerHost === "localhost") {
    var broker = require("./mqttbroker.js");
    broker.setup(mqttConfig.username, mqttConfig.password);
  }
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
    client.turnOn();
  }

  turnOff() {
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
