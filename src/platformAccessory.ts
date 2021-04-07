import { Service, PlatformAccessory, CharacteristicEventTypes, CharacteristicValue, CharacteristicSetCallback } from 'homebridge';
import { SmartDryPlatform } from './platform';
import { SmartDryApi } from './smartdryapi';
import IntervalLoopManager = require('interval-loop-manager');

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class SmartDryPlatformAccessory {
  private service: Service;
  private api: SmartDryApi;
  private serviceType;
  private serviceCharacteristic;
  private serviceCharacteristicOffValue;
  private serviceCharacteristicOnValue;

  // API Endpoint URL
  private readonly apiEndpointUrl: string = 'https://qn54iu63v9.execute-api.us-east-1.amazonaws.com/prod/RDSQuery';

  // Run loop every 60 seconds when drier is running
  private readonly intervalRunning: number = 60000;

  // Run loop every 5 minutes when drier is stopped
  private readonly intervalStopped: number = 300000;

  /**
   * These are used to track the state
   */
  private states = {
    On: false,
  };

  constructor(
    private readonly platform: SmartDryPlatform,
    private readonly accessory: PlatformAccessory,
  ) {

    this.api = new SmartDryApi(this.apiEndpointUrl, accessory.context.device.id, this.platform.log);

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'SmartDry')
      .setCharacteristic(this.platform.Characteristic.Model, 'Unknown')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Unknown');

    if (accessory.context.device.serviceType === 'contactSensor') {
      this.platform.log.info('Setting service type to: ContactSensor');
      this.serviceType = this.platform.Service.ContactSensor;
      this.serviceCharacteristic = this.platform.Characteristic.ContactSensorState;
      this.serviceCharacteristicOffValue = this.platform.Characteristic.ContactSensorState.CONTACT_NOT_DETECTED;
      this.serviceCharacteristicOnValue = this.platform.Characteristic.ContactSensorState.CONTACT_DETECTED;
    } else {
      this.platform.log.info('Setting service type to: Switch');
      this.serviceType = this.platform.Service.Switch;
      this.serviceCharacteristic = this.platform.Characteristic.On;
      this.serviceCharacteristicOffValue = false;
      this.serviceCharacteristicOnValue = true;
    }

    // get the service if it exists, otherwise create a new service
    this.service = this.accessory.getService(this.serviceType) || this.accessory.addService(this.serviceType);

    // default the state to off
    this.service.updateCharacteristic(this.serviceCharacteristic, this.serviceCharacteristicOffValue);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    // set the displayName
    this.service.displayName = accessory.context.device.name;

    this.service.getCharacteristic(this.serviceCharacteristic)
      .on(CharacteristicEventTypes.SET, (value: CharacteristicValue, callback: CharacteristicSetCallback) => {
        this.states.On = value as boolean;
        this.platform.log.info(`[${ this.service.displayName }] state was set to: ` + (this.states.On? 'On': 'Off'));
        this.platform.log.info(`[${ this.service.displayName }] forcing refresh of state in one second due to manual state change`);
        managedLoop.restart({ interval: 1000 });
        callback();
      });

    // update the device state on a timer (will get called right away as well)
    const managedLoop = new IntervalLoopManager(() => {
      this.updateState();

      if (this.states.On) {
        managedLoop.assignValues({ interval: this.intervalRunning });
      } else {
        managedLoop.assignValues({ interval: this.intervalStopped });
      }
    });
    managedLoop.start({ interval: this.intervalRunning });
  }

  private updateState() {
    this.platform.log.debug(`[${ this.service.displayName }] Updating State`);

    this.api.getDeviceState()
      .then((state) => {
        this.platform.log.debug(`[${ this.service.displayName }] state from api: ${ JSON.stringify(state) }`);

        // push the new value to HomeKit
        if (state.loadStart > BigInt(0)) {
          if (!this.states.On) {
            this.platform.log.info(`[${ this.service.displayName }] Setting state to: On`);
          }
          this.service.updateCharacteristic(this.serviceCharacteristic, this.serviceCharacteristicOnValue);
          this.states.On = true;
        } else {
          if (this.states.On) {
            this.platform.log.info(`[${ this.service.displayName }] Setting state to: Off`);
          }
          this.service.updateCharacteristic(this.serviceCharacteristic, this.serviceCharacteristicOffValue);
          this.states.On = false;
        }

        this.platform.log.debug(`[${ this.service.displayName }] State Update Complete`);
      })
      .catch((err) => {
        this.platform.log.error('Unable to load state from SmartDry API: ', err.message);
      });
  }
}
