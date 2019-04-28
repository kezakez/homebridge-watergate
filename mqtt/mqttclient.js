var mqtt = require("mqtt");
var client = null;
var deviceId = "";
var onStateChanged = null;

exports.setup = function (broker, device, username, password) {
  deviceId = device;
  client = mqtt.connect(`mqtt://${broker}`, {
    username,
    password
  });

  client.on("message", function (topic, message, packet) {
    // message is Buffer
    console.log("got message", topic, message.toString());

    if (onStateChanged) {
      const result = JSON.parse(message);

      if (result.POWER) {
        console.log('about to call onStateChanged')
        onStateChanged(result.POWER === "ON");
      }
    }
  });

  client.on("connect", function () {
    console.log("connected");
    client.subscribe(`stat/${deviceId}/RESULT`, function (err) {
      if (err) {
        console.log({ err });
      } else {
        console.log("publishing");
        client.publish(`cmnd/${deviceId}/POWER`);
      }
    });
  });
};

exports.turnOn = function () {
  console.log("on");
  client.publish(`cmnd/${deviceId}/POWER`, "on");
};

exports.turnOff = function () {
  console.log("off");
  client.publish(`cmnd/${deviceId}/POWER`, "off");
};

exports.on = function (event, callback) {
  if (event === "statuschanged") {
    onStateChanged = callback;
  }
};

exports.close = function () {
  client.end();
};
