var mqtt = require("mqtt");
var client = null;
var deviceId = "";
var currentState = false;

exports.setup = function(broker, device, username, password) {
  console.log("starting");
  deviceId = device;
  client = mqtt.connect(`mqtt://${broker}`, {
    username,
    password
  });

  client.on("message", function(topic, message, packet) {
    // message is Buffer
    console.log("got message", topic, message.toString());
    const result = JSON.parse(message);

    if (result.POWER) {
      currentState = result.POWER === "ON";
    }
  });

  client.on("connect", function() {
    console.log("connected");
    client.subscribe(`stat/${deviceId}/RESULT`, function(err) {
      if (err) {
        console.log({ err });
      } else {
        console.log("publishing");
        client.publish(`cmnd/${deviceId}/POWER`);
      }
    });
  });
};

exports.on = function() {
  console.log("on");
  client.publish(`cmnd/${deviceId}/POWER`, "on");
};

exports.off = function() {
  console.log("off");
  client.publish(`cmnd/${deviceId}/POWER`, "off");
};

exports.getState = function() {
  return currentState;
};

exports.close = function() {
  client.end();
};
