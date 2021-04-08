import { AccessoryPlugin, API, Characteristic, Logger, PlatformConfig, Service, StaticPlatformPlugin } from 'homebridge';
import { SmartDryPlatformAccessory } from './platformAccessory';
import { SmartDryApi } from './smartDryApi';
import { UserSettings } from './userSettings';

export class SmartDryPlatform implements StaticPlatformPlugin {

  private readonly smartDryPlatformAccessories: SmartDryPlatformAccessory[] = [];
  private readonly userSettings: UserSettings;

  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly SmartDryApi: SmartDryApi;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.userSettings = new UserSettings(this);
    this.SmartDryApi = new SmartDryApi(this.log);

    if (this.userSettings.SmartDrySensorConfigs.length === 0) {
      this.log.error('No Smart Dry sensors specified. Platform is not loading.');
      return;
    }

    this.buildAccessories();

    this.log.debug(`Platform ${this.userSettings.PluginName} -> Initialized`);
  }

  async accessories(callback: (foundAccessories: AccessoryPlugin[]) => void): Promise<void> {
    callback(this.smartDryPlatformAccessories);
  }

  private buildAccessories() {

    for (const smartDrySensorConfig of this.userSettings.SmartDrySensorConfigs) {

      const smartDryPlatformAccessory = new SmartDryPlatformAccessory(this,
        smartDrySensorConfig.name, smartDrySensorConfig.id, smartDrySensorConfig.serviceType);

      this.log.debug(`Including accessory=${smartDryPlatformAccessory.name}`);

      this.smartDryPlatformAccessories.push(smartDryPlatformAccessory);
    }
  }
}
