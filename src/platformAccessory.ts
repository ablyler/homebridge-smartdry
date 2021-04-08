import { AccessoryPlugin, CharacteristicValue, Service } from 'homebridge';
import { SmartDryPlatform } from './platform';
import { SmartDryConstants } from './smartDryConstants';
import IntervalLoopManager = require('interval-loop-manager');

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SmartDryPlatformAccessory implements AccessoryPlugin {

  private managedLoop: IntervalLoopManager;
  private informationService: Service;
  private binaryService: Service;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private binaryCharacteristic: any;
  private isOn: boolean | undefined;

  constructor(
    private readonly platform: SmartDryPlatform,
    public name: string,
    public id: string,
    public serviceType: string,
  ) {

    // set accessory information
    this.informationService = new this.platform.Service.AccessoryInformation()
      .setCharacteristic(this.platform.Characteristic.Manufacturer, SmartDryConstants.INFORMATION_MANUFACTURER)
      .setCharacteristic(this.platform.Characteristic.Model, SmartDryConstants.INFORMATION_MODEL)
      .setCharacteristic(this.platform.Characteristic.SerialNumber, id);

    if (serviceType === SmartDryConstants.SERVICE_TYPE_CONTACT_SENSOR) {
      this.binaryService = new platform.Service.ContactSensor(this.name);
      this.binaryCharacteristic = this.platform.Characteristic.ContactSensorState;

      // register handlers for the characteristics
      this.binaryService
        .getCharacteristic(this.binaryCharacteristic)
        .onSet(this.setOn.bind(this))
        .onGet(this.getOn.bind(this));
    } else {
      this.binaryService = new platform.Service.Switch(this.name);
      this.binaryCharacteristic = this.platform.Characteristic.On;

      // register handlers for the characteristics
      this.binaryService
        .getCharacteristic(this.binaryCharacteristic)
        .onGet(this.getOn.bind(this));
    }

    // Update the device state on a timer (will get called right away as well)
    this.managedLoop = new IntervalLoopManager(() => {
      this.updateState();
      // HACK to fix issue https://github.com/ablyler/homebridge-smartdry/issues/5
      // calling this function within the callback causes a crash
      // this.managedLoop.assignValues({ interval: this.getLoopInterval() });
    }).start({ interval: SmartDryConstants.INTERVAL_RUNNING_MS });
  }

  private getLoopInterval(): number {
    return this.isOn ? SmartDryConstants.INTERVAL_RUNNING_MS : SmartDryConstants.INTERVAL_STOPPED_MS;
  }

  private async updateState() {

    this.platform.log.debug(`[${ this.name }] Updating State`);

    await this.platform.SmartDryApi.getDeviceState(this.id).then(deviceState => {
      this.platform.log.debug(`[${ this.name }] state from api: ${ JSON.stringify(deviceState) }`);
      if (deviceState.loadStart > BigInt(0)) {
        this.isOn = !this.isOn;
        this.platform.log.info(`Set [${this.name}] state ->`, this.isOn);

        this.binaryService
          .getCharacteristic(this.binaryCharacteristic)
          .updateValue(this.isOn);
      }

      this.platform.log.debug(`[${ this.name }] State Update Complete`);
    }).catch(err => {
      this.platform.log.error('Unable to load state from SmartDry API: ', err.message);
    });
  }

  private async setOn(value: CharacteristicValue): Promise<void> {

    const boolValue = Boolean(value);
    if (boolValue === (this.isOn || SmartDryConstants.DEFAULT_BINARY_STATE)) {
      return;
    }

    this.isOn = boolValue;
    this.platform.log.info(`Set [${this.name}] state ->`, this.isOn);
    this.platform.log.info(`[${ this.name }] forcing refresh of state in one second due to manual state change`);

    this.managedLoop.restart({ interval: SmartDryConstants.INTERVAL_RESTART_MS });
  }

  private async getOn(): Promise<CharacteristicValue> {

    if (this.isOn !== undefined) {
      this.platform.log.debug(`Get [${this.name}] state ->`, this.isOn);
    }

    return (this.isOn || SmartDryConstants.DEFAULT_BINARY_STATE);
  }

  getServices(): Service[] {
    return [this.informationService, this.binaryService];
  }
}
