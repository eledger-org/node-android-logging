/* eslint-env mocha */

var assert = require('chai').assert;

function getLogObject() {
  var Log = require('../index.js');

  Log.setDefaults();
  Log.disableStdout();
  Log.disableStderr();
  Log.enableQueue("Debug");
  Log.emptyQueue();

  return Log;
}

var Log = require('../index.js');

var callbacks = {
  "Fatal": Log.F,
  "Error": Log.E,
  "Warn":  Log.W,
  "Info":  Log.I,
  "Debug": Log.D,
  "Trace": Log.T
};

function logAtLevel(messageLevel, ran) {
  callbacks[messageLevel](ran);
}

describe('Log', function() {
  var msgOnlyRegex = /^.*[ ]/;
  var logLevel = [ "Fatal", "Error", "Warn", "Info", "Debug", "Trace" ];
  var Log = getLogObject();

  describe('peek()', function() {
    it('should return a log line after a Log statement', function() {
      var Log = getLogObject();
      var exp = "blue";

      Log.F(exp);

      assert.equal(Log.peek().replace(msgOnlyRegex, ''), exp);
    });

    it('should return the same most recently logged value if called more than once', function() {
      var Log = getLogObject();
      var exp = "test";

      Log.F("blue");
      Log.F(exp);

      assert.equal(Log.peek(), Log.peek());
    });

    it('should return an empty string when the queue is empty', function() {
      var Log = getLogObject();

      assert.equal(Log.peek(), "");
    });
  });

  describe('emptyQueue()', function() {
    it('should cause peek to return an empty string', function() {
      var Log = getLogObject();
      var msg1 = "msg1";
      var msg2 = "msg2";

      assert.equal(Log.peek(), "");

      Log.F(msg1);
      assert.equal(Log.peek().replace(msgOnlyRegex, ''), msg1);

      Log.F(msg2);

      Log.emptyQueue();
      assert.equal(Log.peek(), "");
    });
  });

  describe('pop()', function() {
    it('should return and remove the first item in the queue', function() {
      var Log = getLogObject();
      var msg1 = "msg1";
      var msg2 = "msg2";

      Log.F(msg1);
      Log.F(msg2);

      assert.equal(Log.peek().replace(msgOnlyRegex, ''), msg1);
      assert.equal(Log.peek(), Log.pop());

      assert.equal(Log.peek().replace(msgOnlyRegex, ''), msg2);
      assert.equal(Log.peek(), Log.pop());
    });
  });

  var combinations = [];

  logLevel.forEach(function(messageLevel) {
    logLevel.forEach(function(configuredLevel) {
      combinations.push({configuredLevel: configuredLevel, messageLevel: messageLevel});
    });
  });

  combinations.forEach(function(combination) {
    let messageLogLevel = combination.messageLevel;
    let configuredLogLevel = combination.configuredLevel;

    let messageLogLevelNum = Log._getIntLevel(messageLogLevel);
    let configuredLogLevelNum = Log._getIntLevel(configuredLogLevel);

    if (messageLogLevelNum <= configuredLogLevelNum) {
      describe(messageLogLevel[0] + "() configured at level " + configuredLogLevel, function() {
        it('should print the message since the configured level is equal or higher', function() {
          combination.ran = Math.random();

          Log = getLogObject();
          Log.enableQueue(combination.configuredLevel);

          logAtLevel(combination.messageLevel, combination.ran);

          assert.equal(Log.peek().replace(msgOnlyRegex, ''), combination.ran);
        });
      });
    } else {
      describe(messageLogLevel[0] + "() configured at level " + configuredLogLevel, function() {
        it('should not print the message since the configured level is lower', function() {
          combination.ran = Math.random();

          Log = getLogObject();
          Log.enableQueue(combination.configuredLevel);

          logAtLevel(combination.messageLevel, combination.ran);

          assert.equal(Log.peek(), "");
        });
      });
    }
  });

  describe('Logging objects', function() {
    describe('Logging an error', function() {
      it('should provide stack trace details and the log message', function() {
        var msg = "msg1";
        var err = new Error(msg);
        var stackLineCount = 0;

        Log = getLogObject();

        Log.F(err);

        let errJson = Log.pop();

        let lines = errJson.split('\n');

        assert.isAtLeast(lines.length, 9);

        lines.forEach(function(line) {
          // Try to identify if a line is a stack trace using this ugly regex:
          if (line.match(/["]?at.*:[0-9]+:[0-9]+[\)]?["]?[,]?$/) !== null) {
            ++stackLineCount;
          }
        });

        // Safe to assume that at least 5 lines that look like stack trace
        //  output indicates that there is a stack trace
        assert.isAtLeast(stackLineCount, 5);
      });
    });

    describe('Log({})', function() {
      it('should pretty print json', function() {
        var msg = {msg: "msg1"};

        Log = getLogObject();

        Log.F(msg);

        let json = Log.pop();

        let lines = json.trim().split('\n');

        assert.equal(lines.length, 4);

        let expectedLines = [];
        expectedLines.push("{");
        expectedLines.push("\"msg\": \"msg1\"");
        expectedLines.push("}");

        lines.slice(1).forEach(function(line) {
          assert.equal(line.trim(), expectedLines.shift());
        });
      });
    });

    describe('Log([])', function() {
      it('should pretty print json', function() {
        var msg = ["msg1", "msg2"];

        Log = getLogObject();

        Log.F(msg);

        let json = Log.pop();

        let lines = json.trim().split('\n');

        assert.equal(lines.length, 5);

        let expectedLines = [];
        expectedLines.push("[");
        expectedLines.push("\"" + msg[0] + "\",");
        expectedLines.push("\"" + msg[1] + "\"");
        expectedLines.push("]");

        lines.slice(1).forEach(function(line) {
          assert.equal(line.trim(), expectedLines.shift());
        });
      });
    });

    describe('Log(undefined)', function() {
      it('should log a blank line', function() {
        Log = getLogObject();

        Log.F(undefined);

        let json = Log.pop();

        assert.notEqual(json, "");
        assert.equal(json.replace(msgOnlyRegex, ''), "");
      });
    });

    describe('Log(true|false)', function() {
      it('should log the string value true when Log(true)', function() {
        Log = getLogObject();

        Log.F(true);

        let json = Log.pop();

        assert.notEqual(json, "");
        assert.equal(json.replace(msgOnlyRegex, ''), "true");
      });

      it('should log the string value false when Log(false)', function() {
        Log = getLogObject();

        Log.F(false);

        let json = Log.pop();

        assert.notEqual(json, "");
        assert.equal(json.replace(msgOnlyRegex, ''), "false");
      });
    });
  });
});

/*

   http://stackoverflow.com/questions/18543047/mocha-monitor-application-output

process.stdout is never going to emit 'data' events because it's not a readable stream. You can read all about that in the node stream documentation, if you're curious.

As far as I know, the simplest way to hook or capture process.stdout or process.stderr is to replace process.stdout.write with a function that does what you want. Super hacky, I know, but in a testing scenario you can use before and after hooks to make sure it gets unhooked, so it's more or less harmless. Since it writes to the underlying stream anyway, it's not the end of the world if you don't unhook it anyway.

function captureStream(stream){
  var oldWrite = stream.write;
  var buf = '';
  stream.write = function(chunk, encoding, callback){
    buf += chunk.toString(); // chunk is a String or Buffer
    oldWrite.apply(stream, arguments);
  }

  return {
    unhook: function unhook(){
     stream.write = oldWrite;
    },
    captured: function(){
      return buf;
    }
  };
}

You can use it in mocha tests like this:

describe('console.log', function(){
  var hook;
  beforeEach(function(){
    hook = captureStream(process.stdout);
  });
  afterEach(function(){
    hook.unhook();
  });
  it('prints the argument', function(){
    console.log('hi');
    assert.equal(hook.captured(),'hi\n');
  });
});
*/

