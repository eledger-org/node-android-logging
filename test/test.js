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

describe('Log', function() {
  describe('peek()', function() {
    it('should return a log line after a Log statement', function() {
      var Log = getLogObject();
      var exp = "blue";

      Log.F(exp);

      assert.equal(Log.peek().replace(/^.*[ ]/, ''), exp);
    });

    it('should return the same most recently logged value if called more than once', function() {
      var Log = getLogObject();
      var exp = "test";

      Log.F("blue");
      Log.F(exp);

      assert.equal(Log.peek(), Log.peek());
    });

    it('should return an empty string when the queue is empty.', function() {
      var Log = getLogObject();

      assert.equal(Log.peek(), "");
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

