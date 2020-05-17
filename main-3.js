const profiler = require("./simple-profiler");

setInterval(function testMemoryLeak() {
  const a = 1;
}, 1000);

profiler.init("./");
