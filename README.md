# srvpro-kof
A module for replacing Challonge for SRVPro, intracting with CoolQ creating KOF matches

# How to use
Replace this module as the Challonge module in SRVPro. set `use_custom_challonge_module` to the path of this project.

# Configs
The configs of this project is at `settings.modules.challonge.options` of SRVPro's config.
eg.
```json
      {
        "launch": {
          "apiRoot": "http://10.198.6.99:57300/",
          "accessToken": "11",
          "secret": "22"
        },
		    "port": 57302,
		    "address": "0.0.0.0",
        "server_ip": "koishi.momobako.com",
        "server_port": 797,
        "auto_accept_request": false,
        "accept_password": "123"
      },
```

* `launch`: The lanuch config for CoolQ HTTP API.
* `port` `address`: The address and port the CoolQ HTTP API server listens at.
* `server_ip` `server_port`: The YGOPro server info displayed at creating matches.
* `auto_accept_request`: If true, the bot would auto request incoming request adding friend or being invited to groups.
* `accept_password`: The password for friend or group requests. Null for no password. 
