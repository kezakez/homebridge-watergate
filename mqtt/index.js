var client = require("./mqtt/mqttclient.js");
var server = require("./mqtt/mqttserver.js");

var mqtt = require("mqtt");
var client = null;
var deviceId = "";
var onStateChanged = null;

exports.setup = function(config) {
  if (!config.broker) {
    server.setup(config.username, config.password);
  }
  client.setup("localhost", "sonoff", config.username, config.password);
};

exports.turnOn = function() {
  client.turnOn();
};

exports.turnOff = function() {
  client.turnOff();
};

exports.on = function(event, callback) {};

exports.close = function() {
  client.end();
};
