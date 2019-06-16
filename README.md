# homebridge-watergate
A homebridge plugin that lets you control a watering system with siri. Works with MQTT switches or GPIO pins on a raspberry pi

Example homebridge config.json
```
{
  "bridge": {
    "name": "TesterMac Homebridge",
    "username": "FF:FF:ED:DE:AD:30",
    "port": 51826,
    "pin": "999-991-999"
  },
  "description": "Homebridge at my house",
  "platforms": [
    {
      "platform": "Watergate",
      "name": "Watergate",
      "gpio": {
        "enabled": true,
        "pins": [
          {
            "pin": 14,
            "enabled": false,
            "name": ""
          },
          {
            "pin": 15,
            "enabled": false,
            "name": ""
          },
          {
            "pin": 18,
            "enabled": true,
            "name": "Fernary"
          },
          {
            "pin": 23,
            "enabled": true,
            "name": "Side Gardens"
          },
          {
            "pin": 24,
            "enabled": false,
            "name": ""
          },
          {
            "pin": 25,
            "enabled": false,
            "name": ""
          },
          {
            "pin": 8,
            "enabled": false,
            "name": ""
          },
          {
            "pin": 7,
            "enabled": false,
            "name": ""
          }
        ]
      },
      "mqtt": {
        "enabled": false,
        "broker": "192.168.0.2",
        "username": "admin",
        "password": "password",
        "devices": [
          {
            "topic": "sonoff",
            "name": "fake",
            "enabled": true
          }
        ]
      }
    }
  ]
}
```
