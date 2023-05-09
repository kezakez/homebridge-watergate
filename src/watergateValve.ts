import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { WatergatePlatform } from './platform';
import { GpioDevice } from './gpioDevice';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory registered
 */
export class WatergateValve {
  private service: Service;

  private startTime: Date | null = null;
  private timeoutHandle: NodeJS.Timeout | null = null;
  private gpio: GpioDevice;

  constructor(
    private readonly platform: WatergatePlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');

    // get the Valve service if it exists, otherwise create a new Valve service
    this.service = this.accessory.getService(this.platform.Service.Valve) || this.accessory.addService(this.platform.Service.Valve);

    // set the service name, this is what is displayed as the default name on the Home app
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.gpio = new GpioDevice(accessory.context.device.pin, this.platform);

    // see https://developers.homebridge.io/#/service/Valve

    this.service.getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.setActive.bind(this))
      .onGet(this.getActive.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.InUse)
      .onGet(this.getInUse.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.ValveType)
      .onGet(this.getValveType.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.SetDuration)
      .onSet(this.setSetDuration.bind(this))
      .onGet(this.getSetDuration.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.RemainingDuration)
      .onGet(this.getRemainingDuration.bind(this));
  }

  async setActive(value: CharacteristicValue) {
    const active = value as boolean;
    this.startTime = active ? new Date() : null;
    this.platform.log.debug('SetActive: ', active, this.startTime);

    this.gpio.write(active);

    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
    if (active) {
      const runSeconds = this.calculateRemainingDuration();
      this.service.setCharacteristic(this.platform.Characteristic.RemainingDuration, runSeconds);
      this.platform.log.debug(`turning off in ${runSeconds} seconds`);

      this.timeoutHandle = setTimeout(() => {
        this.platform.log.debug("turning off");
        this.service.setCharacteristic(this.platform.Characteristic.Active, this.platform.Characteristic.Active.INACTIVE);
      }, runSeconds * 1000);
    } else {
      this.service.setCharacteristic(this.platform.Characteristic.RemainingDuration, 0);
    }
    this.service.setCharacteristic(this.platform.Characteristic.InUse, active);
  }

  async getActive(): Promise<CharacteristicValue> {
    const isOn = !!this.startTime;
    this.platform.log.debug('GetActive: ', isOn);
    return isOn;
  }

  async getInUse(): Promise<CharacteristicValue> {
    const isOn = this.gpio.read() || !!this.startTime;
    this.platform.log.debug('GetInUse: ', isOn);
    return isOn;
  }

  async getValveType(): Promise<CharacteristicValue> {
    return this.platform.Characteristic.ValveType.IRRIGATION;
  }

  private getDuration(): number {
    return Math.max(this.accessory.context.duration || 0, 1*60);
  }

  async getSetDuration(): Promise<CharacteristicValue> {
    const duration = this.getDuration();
    this.platform.log.debug('getSetDuration: ', duration);
    return duration;
  }

  async setSetDuration(value: CharacteristicValue) {
    this.platform.log.debug('setSetDuration', value);
    const duration = value as number;
    this.accessory.context.duration = duration;
  }

  async getRemainingDuration(): Promise<CharacteristicValue> {
    this.platform.log.debug('getRemainingDuration');
    return this.calculateRemainingDuration();
  }

  shutdown() {
    this.gpio.close();
  }

  private calculateRemainingDuration(): number { 
    if (!this.startTime) {
      return 0;
    }
    const duration = this.getDuration();
    const now = new Date();
    const currentRunTime = (now.getTime() - this.startTime.getTime()) / 1000;
    const remaining = Math.round(duration - currentRunTime);
    if (remaining > 0) {
      return remaining;
    }
    return 0;
  }
}