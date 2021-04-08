import { PlatformConfig } from 'homebridge';
import { SmartDryPlatform } from './platform';
import { PLUGIN_NAME } from './settings';
import { SmartDryConstants } from './smartDryConstants';
import { SmartDrySensorConfig } from './smartDryTypes';

export class UserSettings {

    public PluginName = PLUGIN_NAME;
    public SmartDrySensorConfigs: SmartDrySensorConfig[] = [];

    private config : PlatformConfig;

    constructor(
        private platform: SmartDryPlatform,
    ) {
      this.config = this.platform.config;

      this.buildName();
      this.buildSmartDrySensorConfigs();
    }

    private buildName() {

      if (this.config.name === undefined) {
        return;
      }

      this.PluginName = this.config.name;
    }

    private buildSmartDrySensorConfigs() {

      if (this.config.sensors === undefined || this.config.sensors.length === 0) {
        return;
      }

      for (const sensor of this.config.sensors) {
        const smartDrySensorConfig: SmartDrySensorConfig = {
          name: sensor.name,
          id: sensor.id,
          serviceType: sensor.serviceType === SmartDryConstants.SERVICE_TYPE_CONTACT_SENSOR ?
            SmartDryConstants.SERVICE_TYPE_CONTACT_SENSOR : SmartDryConstants.SERVICE_TYPE_SWITCH,
        };

        this.SmartDrySensorConfigs.push(smartDrySensorConfig);
      }
    }
}
