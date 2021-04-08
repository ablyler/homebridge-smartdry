# homebridge-smartdry

SmartDry plug-in for [Homebridge](https://github.com/nfarina/homebridge) using the undocumented SmartDry API.

`homebridge-smartdry` exposes the dryer sensor as a either `switch` or `contact sensor` that shows if the dryer is running or stopped.
## Installation

Before installing this plugin, you should install Homebridge using the [official instructions](https://github.com/homebridge/homebridge/wiki).

### Install via Homebridge Config UI X
1. Search for `Homebridge SmartDry` on the Plugins tab of [Config UI X](https://www.npmjs.com/package/homebridge-config-ui-x).
2. Install the `Homebridge SmartDry` plugin and use the form to enter your configuration.

### Manual Installation
2. Install this plug-in using: `npm install -g homebridge-smartdry`
3. Update your configuration file. See example `config.json` snippet below.

## Configuration

Configuration sample (edit `~/.homebridge/config.json`):

```json
{
  "platform": "SmartDry",
  "name": "Homebridge SmartDry",
  "sensors": [
    {
      "id": "XXXXXX",
      "name": "Samsung Dryer",
      "serviceType": "contactSensor"
    }
  ]
}
```

Required fields:

* `"id"`: The ID of your SmartDry device. You can find this in the settings of the SmartDry iOS App.
* `"name"`: The name you should like to give your device, such as Samsung Dryer.
* `"serviceType"`: The service type to expose the device as, either `contactSensor` or `switch` (default).

## Things to try with Siri

* Hey Siri, *is the Samsung Dryer on*?
