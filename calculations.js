const turnOff = (valveService, client) => {
  clearOffTimer();
  startTime = null;
  client.turnOff();
  valveService.setCharacteristic(Characteristic.InUse, 0);
};

const clearOffTimer = () => {
  if (timeoutHandle) {
    console.log("clearing timeout");
    clearTimeout(timeoutHandle);
  }
};

const updateOffTimer = (valveService, turnOffSeconds) => {
  clearOffTimer();
  console.log(`turning off in ${turnOffSeconds} seconds`);
  timeoutHandle = setTimeout(() => {
    console.log("turning off");
    valveService.setCharacteristic(Characteristic.Active, 0);
    turnOff(valveService);
  }, turnOffSeconds * 1000);
};

const turnOn = (valveService, durationSeconds, client) => {
  startTime = new Date();
  client.turnOn();
  valveService.setCharacteristic(Characteristic.InUse, 1);
  valveService.setCharacteristic(Characteristic.SetDuration, durationSeconds);

  const remainingSeconds = secondsRemaining(startTime, durationSeconds);

  updateOffTimer(valveService, remainingSeconds);
};
