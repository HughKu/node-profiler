const profiler = require("./simple-profiler");

let theThing = null;
let replaceThing = function () {
  const originalThing = theThing;
  const unused = function () {
    if (originalThing) console.log("hi");
  };
  theThing = {
    longStr: new Array(1000000).join("*"),
    someMethod: function () {
      console.log(someMessage);
    },
  };
};

profiler.init("./");
setInterval(replaceThing, 1000);
