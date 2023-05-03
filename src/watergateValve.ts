import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { WatergatePlatform } from './platform';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class WatergateValve {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private states = {
    Active: false,
    StartTime: null as Date | null,
    DurationSeconds: 0,
  };

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
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.Valve) || this.accessory.addService(this.platform.Service.Valve);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Valve

    // register handlers for the Active Characteristic
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

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setActive(value: CharacteristicValue) {
    const active = value as boolean;
    this.platform.log.debug('SetActive: ', active);
    this.service.setCharacteristic(this.platform.Characteristic.InUse, active);
    //TODO set pin
    this.states.Active = active;
    this.states.StartTime = active ? new Date() : null;
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possible. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getActive(): Promise<CharacteristicValue> {
    const isOn = this.states.Active;
    this.platform.log.debug('GetActive: ', isOn);
    return isOn;
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possible. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.
 
   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getInUse(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const isOn = this.states.Active;
    //TODO read from pin
    this.platform.log.debug('GetInUse: ', isOn);
    return isOn;
  }

  async getValveType(): Promise<CharacteristicValue> {
    return this.platform.Characteristic.ValveType.IRRIGATION;
  }

  async setSetDuration(value: CharacteristicValue) {
    this.platform.log.debug('setSetDuration');
    this.states.DurationSeconds = value as number;
  }

  async getSetDuration(): Promise<CharacteristicValue> {
    const seconds = this.states.DurationSeconds;
    this.platform.log.debug('getSetDuration: ', seconds);
    return seconds;
  }

  async getRemainingDuration(): Promise<CharacteristicValue> {
    this.platform.log.debug('getRemainingDuration');
    if (!this.states.StartTime) {
      return 0;
    }
    const now = new Date();
    const currentRunTime = (now.getTime() - this.states.StartTime.getTime()) / 1000;
    const remaining = Math.round(this.states.DurationSeconds - currentRunTime);
    if (remaining > 0) {
      return remaining;
    }
    return 0;
  }

}