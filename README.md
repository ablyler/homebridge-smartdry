# homebridge-smartdry

SmartDry plug-in for [Homebridge](https://github.com/nfarina/homebridge) using the undocumented SmartDry API.

Currently, homebridge-smartdry exposes the drier sensor as a switch that shows if the drier is running or stopped.

# Installation

<!-- 2. Clone (or pull) this repository from github into the same path Homebridge lives (usually `/usr/local/lib/node_modules`). Note: the code currently on GitHub is in beta, and is newer than the latest published version of this package on `npm` -->
1. Install homebridge using: `npm install -g homebridge`
2. Install this plug-in using: `npm install -g homebridge-smartdry`
3. Update your configuration file. See example `config.json` snippet below.

# Configuration

Configuration sample (edit `~/.homebridge/config.json`):

```
"platforms": [
        {
            "platform": "SmartDry",
            "sensors": [
                {
                    "id": "XXXXXX",
                    "name": "Drier"
                }
            ]
        }
    ],
```

Required fields:

* `"id"`: The ID of your SmartDry device. You can find this in the settings of the SmartDry iOS App.
* `"name"`: The name you should like to give your device, such as Drier.

# HomeKit Accessory Types

## Drier

* *Switch* accessory indicating drier Running/Stopped state

# Things to try with Siri

* Hey Siri, *is the Drier on*?
