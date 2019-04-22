// valve instance sets up characteristics

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

exports.bindValveService = function(valveService, log) {
  log("binding watergate valve");

  let timeoutHandle = null;
  let startTime = null;
  let durationSeconds = 300;

  valveService.getCharacteristic(Characteristic.ValveType).updateValue(1);

  valveService
    .getCharacteristic(Characteristic.Active)
    .on("set", function(value, callback) {
      log("set Active " + value);
      if (value) {
        //turnOn(valveService, durationSeconds, plugin.client);
      } else {
        //turnOff(valveService, plugin.client);
      }
      callback();
    })
    .on("get", function(callback) {
      const active = startTime !== null;
      log("get Active " + active);
      callback(null, active);
    });

  valveService
    .getCharacteristic(Characteristic.SetDuration)
    .on("set", function(value, callback) {
      log("set SetDuration " + value);
      durationSeconds = value;
      valveService.setCharacteristic(
        Characteristic.RemainingDuration,
        secondsRemaining(startTime, durationSeconds)
      );

      callback();
    })
    .on("get", function(callback) {
      log("get SetDuration " + durationSeconds);
      callback(null, durationSeconds);
    });

  valveService
    .getCharacteristic(Characteristic.RemainingDuration)
    .on("set", function(value, callback) {
      log("set Remaining " + value);
      //updateOffTimer(valveService, value);
      callback();
    })
    .on("get", function(callback) {
      const remaining = secondsRemaining(startTime, durationSeconds);
      log("get Remaining " + remaining);
      callback(null, remaining);
    });

  return valveService;
};
