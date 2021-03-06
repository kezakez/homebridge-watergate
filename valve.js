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

exports.bindValveService = function (valveService, device, log) {
  log("binding watergate valve");

  let timeoutHandle = null;
  let startTime = null;
  let durationSeconds = 300;

  const clearOffTimer = () => {
    if (timeoutHandle) {
      console.log("clearing timeout");
      clearTimeout(timeoutHandle);
    }
  };

  const turnOff = () => {
    clearOffTimer();
    startTime = null;
    device.turnOff();
    valveService.setCharacteristic(Characteristic.InUse, 0);
  };

  const updateOffTimer = turnOffSeconds => {
    clearOffTimer();
    console.log(`turning off in ${turnOffSeconds} seconds`);
    timeoutHandle = setTimeout(() => {
      console.log("turning off");
      valveService.setCharacteristic(Characteristic.Active, 0);
      turnOff(valveService);
    }, turnOffSeconds * 1000);
  };

  const turnOn = () => {
    console.log("turnOn");

    startTime = new Date();
    device.turnOn();
    valveService.setCharacteristic(Characteristic.InUse, 1);
    valveService.setCharacteristic(Characteristic.SetDuration, durationSeconds);

    const remainingSeconds = secondsRemaining(startTime, durationSeconds);

    updateOffTimer(remainingSeconds);
  };

  valveService.getCharacteristic(Characteristic.ValveType).updateValue(1);

  valveService
    .getCharacteristic(Characteristic.Active)
    .on("set", function (value, callback) {
      log("set Active " + value);
      if (value) {
        turnOn();
      } else {
        turnOff();
      }
      callback();
    })
    .on("get", function (callback) {
      const active = startTime !== null;
      log("get Active " + active);
      callback(null, active ? 1 : 0);
    });

  valveService
    .getCharacteristic(Characteristic.SetDuration)
    .on("set", function (value, callback) {
      log("set SetDuration " + value);
      durationSeconds = value;
      valveService.setCharacteristic(
        Characteristic.RemainingDuration,
        secondsRemaining(startTime, durationSeconds)
      );

      callback();
    })
    .on("get", function (callback) {
      log("get SetDuration " + durationSeconds);
      callback(null, durationSeconds);
    });

  valveService
    .getCharacteristic(Characteristic.RemainingDuration)
    .on("set", function (value, callback) {
      log("set Remaining " + value);
      updateOffTimer(value);
      callback();
    })
    .on("get", function (callback) {
      const remaining = secondsRemaining(startTime, durationSeconds);
      log("get Remaining " + remaining);
      callback(null, remaining);
    });

  device.on('statuschanged', status => {
    valveService
      .getCharacteristic(Characteristic.Active)
      .updateValue(status ? 1 : 0);
    valveService
      .getCharacteristic(Characteristic.InUse)
      .updateValue(status ? 1 : 0);
  });

  return valveService;
};
