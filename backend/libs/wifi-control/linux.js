(function () {
  var connectionStateMap, parsePatterns, powerStateMap;

  parsePatterns = {
    nmcli_line: new RegExp(/([^:]+):\s+(.+)/)
  };

  connectionStateMap = {
    connected: "connected",
    disconnected: "disconnected",
    connecting: "connecting"
  };

  powerStateMap = {
    enabled: true,
    disabled: false
  };

  module.exports = {
    autoFindInterface: function () {
      var _iface, _interface, _interfaceLine, _msg, findInterfaceCom, parsedLine;
      this.WiFiLog("Host machine is Linux.");
      findInterfaceCom = "nmcli -m multiline device status | grep wlan";
      this.WiFiLog("Executing: " + findInterfaceCom);
      _interfaceLine = this.execSync(findInterfaceCom);
      parsedLine = parsePatterns.nmcli_line.exec(_interfaceLine.trim());
      _interface = parsedLine[2];
      if (_interface) {
        _iface = _interface.trim();
        _msg = "Automatically located wireless interface " + _iface + ".";
        this.WiFiLog(_msg);
        return {
          success: true,
          msg: _msg,
          "interface": _iface
        };
      } else {
        _msg = "Error: No network interface found.";
        this.WiFiLog(_msg, true);
        return {
          success: false,
          msg: _msg,
          "interface": null
        };
      }
    },
    getIfaceState: function () {
      var KEY, VALUE, connectionData, connectionName, error, error1, error2, foundInterface, i, interfaceState, k, len,
        ln, parsedLine, powerData, ref, ssidData;
      interfaceState = {};
      powerData = this.execSync("nmcli networking");
      interfaceState.power = powerStateMap[powerData.trim()];
      if (interfaceState.power) {
        foundInterface = false;
        connectionData = this.execSync("nmcli -m multiline device status");
        connectionName = null;
        ref = connectionData.split('\n');
        for (k = i = 0, len = ref.length; i < len; k = ++i) {
          ln = ref[k];
          try {
            parsedLine = parsePatterns.nmcli_line.exec(ln.trim());
            KEY = parsedLine[1];
            VALUE = parsedLine[2];
            if (VALUE === "--") {
              VALUE = null;
            }
          } catch (error1) {
            error = error1;
            continue;
          }
          switch (KEY) {
            case "DEVICE":
              if (VALUE === this.WiFiControlSettings.iface) {
                foundInterface = true;
              }
              break;
            case "STATE":
              if (foundInterface) {
                interfaceState.connection = connectionStateMap[VALUE];
              }
              break;
            case "CONNECTION":
              if (foundInterface) {
                connectionName = VALUE;
              }
          }
          if (KEY === "CONNECTION" && foundInterface) {
            break;
          }
        }
        if (!foundInterface) {
          return {
            success: false,
            msg: "Unable to retrieve state of network interface " + this.WiFiControlSettings.iface + "."
          };
        }
        if (connectionName) {
          try {
            ssidData = this.execSync("nmcli -m multiline connection show \"" + connectionName + "\" | grep 802-11-wireless.ssid");
            parsedLine = parsePatterns.nmcli_line.exec(ssidData.trim());
            interfaceState.ssid = parsedLine[2];
          } catch (error2) {
            error = error2;
            return {
              success: false,
              msg: "Error while retrieving SSID information of network interface " + this.WiFiControlSettings.iface + ": " + error.stderr
            };
          }
        } else {
          interfaceState.ssid = null;
        }
      } else {
        interfaceState.connection = connectionStateMap[VALUE];
        interfaceState.ssid = null;
      }
      return interfaceState;
    },
    scanForWiFi: function () {
      var KEY, VALUE, _network, c, error, error1, i, j, k, len, len1, ln, networks, nwk, parsedLine, ref, ref1,
        scanResults;
      scanResults = this.execSync("nmcli -m multiline device wifi list");
      networks = [];
      ref = scanResults.split('*:');
      for (c = i = 0, len = ref.length; i < len; c = ++i) {
        nwk = ref[c];
        if (c === 0) {
          continue;
        }
        _network = {};
        ref1 = nwk.split('\n');
        for (k = j = 0, len1 = ref1.length; j < len1; k = ++j) {
          ln = ref1[k];
          try {
            parsedLine = parsePatterns.nmcli_line.exec(ln.trim());
            KEY = parsedLine[1];
            VALUE = parsedLine[2];
          } catch (error1) {
            error = error1;
            continue;
          }
          switch (KEY) {
            case "SSID":
              _network.ssid = String(VALUE);
              break;
            case "CHAN":
              _network.channel = String(VALUE);
              break;
            case "SIGNAL":
              _network.signal_level = String(VALUE);
              break;
            case "SECURITY":
              _network.security = String(VALUE);
          }
        }
        if (_network.ssid !== "--") {
          networks.push(_network);
        }
      }
      return networks;
    },
    connectToAP: function (_ap) {
      var COMMANDS, _msg, com, connectToAPChain, error, error1, error2, i, len, ssidExist, stdout;
      COMMANDS = {
        "delete": "nmcli connection delete \"" + _ap.ssid + "\"",
        connect: "nmcli device wifi connect \"" + _ap.ssid + "\""
      };
      if (_ap.password.length) {
        COMMANDS.connect += " password \"" + _ap.password + "\"";
      }
      try {
        stdout = this.execSync("nmcli connection show \"" + _ap.ssid + "\"");
        if (stdout.length) {
          ssidExist = true;
        }
      } catch (error1) {
        error = error1;
        ssidExist = false;
      }
      connectToAPChain = [];
      if (ssidExist) {
        this.WiFiLog("It appears there is already a connection for this SSID.");
        connectToAPChain.push("delete");
      }
      connectToAPChain.push("connect");
      for (i = 0, len = connectToAPChain.length; i < len; i++) {
        com = connectToAPChain[i];
        this.WiFiLog("Executing:\t" + COMMANDS[com]);
        try {
          stdout = this.execSync(COMMANDS[com]);
        } catch (error2) {
          error = error2;
          if (error.stderr.toString().trim() === ("Error: No network with SSID '" + _ap.ssid + "' found.")) {
            _msg = "Error: No network called " + _ap.ssid + " could be found.";
            this.WiFiLog(_msg, true);
            return {
              success: false,
              msg: _msg
            };
          } else if (error.stderr.toString().search(/Error:/ !== -1)) {
            _msg = error.stderr.toString().trim();
            this.WiFiLog(_msg, true);
            return {
              success: false,
              msg: _msg
            };
          }
          if (!/nmcli device wifi connect/.test(COMMANDS[com])) {
            this.WiFiLog(error, true);
            return {
              success: false,
              msg: error
            };
          }
        }
        this.WiFiLog("Success!");
      }
    },
    resetWiFi: function () {
      var COMMANDS, _msg, com, i, len, resetWiFiChain, results, stdout;
      COMMANDS = {
        disableNetworking: "nmcli networking off",
        enableNetworking: "nmcli networking on"
      };
      resetWiFiChain = ["disableNetworking", "enableNetworking"];
      results = [];
      for (i = 0, len = resetWiFiChain.length; i < len; i++) {
        com = resetWiFiChain[i];
        this.WiFiLog("Executing:\t" + COMMANDS[com]);
        stdout = this.execSync(COMMANDS[com]);
        _msg = "Success!";
        results.push(this.WiFiLog(_msg));
      }
      return results;
    },
    disconnect: function (ssid) {
      var CMD, stdout;
      CMD = "nmcli connection delete " + ssid;
      this.WiFiLog("Executing:\t" + CMD);
      try {
        stdout = this.execSync(CMD);
        this.WiFiLog("Success!");
      } catch (err) {
        this.WiFiLog("Failure!", err.stderr.toString().trim())
      }
    }
  };

}).call(this);