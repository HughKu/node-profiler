const profiler = require("./simple-profiler");
profiler.init("./dump-memory-usage");

let leakObject = null;
let count = 0;
setInterval(function testMemoryLeak() {
  const originLeakObject = leakObject;
  const unused = function () {
    if (originLeakObject) {
      console.log("originLeakObject");
    }
  };
  leakObject = {
    count: String(count++),
    leakStr: new Array(1e9).join("*"),
    leakMethod: function () {
      console.log("leakMessage");
    },
  };
}, 1000);
