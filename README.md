# node-android-logging

## About

A node.js logging library intended to replicate the Android logging format

## Example

### Code (See example/simple-example.js)

    var Log = require('log');

    Log.D("Log message");

### Output

    D/simple-example.js <anonymous> (    3): Log message

## More interesting example logging a caught exception

### Code (See example/error-example.js)

    var Log = require('log');

    function testError() {
      try {
        throw new Error("What an error!");
      } catch (ex) {
        Log.E(ex);
      }
    }

    testError();

### Output

    E/error-example.js testError    (    7):
        {
          "error": "Error: What an error!",
          "stack": [
            "at testError (/var/node_logging/example/error-example.js:5:11)",
            "at Object.<anonymous> (/var/node_logging/example/error-example.js:11:1)",
            "at Module._compile (module.js:410:26)",
            "at Object.Module._extensions..js (module.js:417:10)",
            "at Module.load (module.js:344:32)",
            "at Function.Module._load (module.js:301:12)",
            "at Function.Module.runMain (module.js:442:10)",
            "at startup (node.js:136:18)",
            "at node.js:966:3"
          ]
        }

