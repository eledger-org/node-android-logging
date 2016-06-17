var Log = require("../../node-android-logging");

function testError() {
  try {
    throw new Error("What an error!");
  } catch (ex) {
    Log.E(ex);
  }
}

testError();

