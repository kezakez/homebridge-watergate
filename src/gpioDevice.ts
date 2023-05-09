// write to GPIO pins
import { existsSync } from "fs";
import { Gpio } from "onoff";
import { WatergatePlatform } from "./platform";

export class GpioDevice {

  private pin: number;
  private platform: WatergatePlatform;
  private gpio: Gpio | null = null;

  constructor(pin: number, platform: WatergatePlatform) {
    this.pin = pin;
    this.platform = platform;
    // check if file or directory exists
    if (existsSync('/sys/class/gpio/export')) {
      this.gpio = new Gpio(pin, "out");
    }
  }

  write(on: boolean) {
    try {
      const value = on ? 1 : 0;
      if (this.gpio) {
        this.gpio.writeSync(value);
      } else {
        this.platform.log.debug(`gpio ${this.pin} would be set to ${value}`);
      }
    } catch (error: any) {
      this.platform.log.error('unable to turn on', error.message)
    }
  }

  read(): boolean | null {
    try {
      if (this.gpio) {
        const value = this.gpio.readSync();
        return value.valueOf() === 1 ? true : false;
      } else {
        this.platform.log.debug(`gpio ${this.pin} would be read from`)
      }
    } catch (error: any) {
      this.platform.log.error('unable to read from pin', error.message)
    }
    return null;
  }

  close() {
    if (this.gpio) {
      this.gpio.unexport();
    } else {
      this.platform.log.debug(`gpio ${this.pin} would be unexported`)
    }
  }
}