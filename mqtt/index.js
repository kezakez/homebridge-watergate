// mqtt related functionality

var client = require("./mqttclient.js");

exports.setupDevices = function (mqttConfig) {
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
  }).filter(device => !!device);
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
    client.on(event, callback);
  }

  close() {
    client.end();
  }
}
