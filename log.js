var $         = require('./jquery').$;
var circJSON  = require('circular-json');
var path      = require('path');
var printf    = require('util').format;
var inspect   = require('util').inspect;

String.prototype.padLeft = function(padValue) {
  return String(padValue + this).slice(-padValue.length);
};

String.prototype.padRight = function(padValue) {
  return String(this + padValue).slice(0, padValue.length);
};

module.exports.Stacktrace = function() {
  return (new Error("Stacktrace:")).stack;
};

/* Don't call this function directly except from this function. */
module.exports.Log = function(logLevel, message) {
  try {
    if (this.bla === undefined) {
      this.bla = 0;
    }
    ++this.bla;

    Log = require('./log');

    var originalMessage = message;
    var messageKeys = Object.keys(message);

    if (messageKeys[messageKeys.length - 1] === "0") {
      // There's only one entry. (obj or string I think?)
      message = message["0"];
    } else if (message != null && typeof message === "object") {
      // There was more than one entry. (array, I think?)
      var newMessage = Array();

      for (i = 0; i < messageKeys.length; ++i) {
        key = messageKeys[i]

        newMessage[messageKeys[i]] = message[messageKeys[i]];
      }

      message = newMessage;

      if (message.length === 0) {
        message = Array.from(originalMessage);
      }
    }

    if (typeof message === "string") {
      try {
        message = ("\n" + circJSON.stringify(JSON.parse(message), null, 2)).replace(/\n/g, "\n    ");
      } catch (ex) {
        message = printf(message);
      }
    } else if (Array.isArray(message)) {
      try {
        message = printf.apply(null, message);
      } catch (ex) {
        message = circJSON.stringify(message);
      }
    } else if (message != null && typeof message == "object") {
      var c = Object.prototype.toString.call(message);

      if (c === "[object Error]") {
        message = {"errorMessage": message, "stack": message.stack};
      }

      message = ("\n" + circJSON.stringify(message, null, 2)).replace(/(\n)|(\\n)/g, "\n    ");
    }

    var stacktrace = module.exports.Stacktrace().split("\n")[4];

    var flc = "";

    try {
      flc = stacktrace.match(/\(.*/)[0];
      flc = flc.replace(/[\(\)]/g, '');
    } catch (ex) {
      // if that errors, it's probably because the path doesn't have parentheses.
      flc = stacktrace.match(/[^ ]*$/)[0];
    }

    var file  = flc.match(/^[^:]*/)[0];
        file  = path.basename(file);
    var line  = flc.match(/[:][^:]*[:]/)[0].replace(/[:]/g, '');

    file = file.padRight("                    ");
    line = line.padLeft ("     ");

    prefix  = printf("%s/%s(%s):", logLevel, file, line);

    console.log(printf("%s %s", prefix, message));
  } catch (ex) {
    console.log("Failed to log message: " + ex + "\n" + ex.stack);
  }
};

module.exports.Error = function() {
  module.exports.Log("E", Array.from(arguments));
};

module.exports.Warn = function() {
  module.exports.Log("W", Array.from(arguments));
};

module.exports.Info = function() {
  module.exports.Log("I", Array.from(arguments));
};

module.exports.Debug = function() {
  module.exports.Log("D", Array.from(arguments));
};

module.exports.E = module.exports.Error;
module.exports.W = module.exports.Warn;
module.exports.I = module.exports.Info;
module.exports.D = module.exports.Debug;

module.exports.e = module.exports.E;
module.exports.w = module.exports.W;
module.exports.i = module.exports.I;
module.exports.d = module.exports.D;

