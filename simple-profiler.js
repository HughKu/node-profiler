/**
 * Simple userland heapdump generator using v8-profiler
 * Usage: require('[path_to]/HeapDump').init('datadir')
 *
 * @module HeapDump
 * @type {exports}
 */
const fs = require("fs");
const profiler = require("v8-profiler-node8");
let _datadir = null;
let nextMBThreshold = 0;

/**
 * Creates a heap dump if the currently memory threshold is exceeded
 */
function heapDump() {
  const memMB = process.memoryUsage().rss / 1048576;
  console.log(memMB + ">" + nextMBThreshold);
  if (memMB > nextMBThreshold) {
    // console.log('Current memory usage: %j', process.memoryUsage());
    nextMBThreshold += 50;
    const snap = profiler.takeSnapshot("profile");
    saveHeapSnapshot(snap, _datadir);
  }
}

/**
 * Saves a given snapshot
 *
 * @param snapshot Snapshot object
 * @param datadir Location to save to
 */
function saveHeapSnapshot(snapshot, datadir) {
  let buffer = "";
  const stamp = Date.now();
  snapshot.serialize(
    function iterator(data, length) {
      buffer += data;
    },
    function complete() {
      const name = stamp + ".heapsnapshot";
      fs.writeFile(datadir + "/" + name, buffer, function () {
        console.log("Heap snapshot written to " + name);
      });
    }
  );
}

/**
 * Create a memory usage dump
 */
function memoryUsageDump() {
  const UNIT = 1048576; // (1024 / 1024);
  const { rss, heapTotal, heapUsed, external } = process.memoryUsage();
  console.log(
    `[rss, heapTotal, heapUsed, external] = [${rss / UNIT}, ${
      heapTotal / UNIT
    }, ${heapUsed / UNIT}, ${external / UNIT}]`
  );
}

/**
 * Schedule a heapdump by the end of next tick
 */
function nextTickDump() {
  setImmediate(function () {
    heapDump();
    memoryUsageDump();
  });
}

/**
 * Init and scheule heap dump runs
 *
 * @param datadir Folder to save the head dump to
 */
module.exports.init = function (datadir, internal = 500) {
  _datadir = datadir;
  setInterval(nextTickDump, internal);
};
