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
    _saveHeapSnapshot(snap, _datadir);
  }
}

/**
 * Saves a given snapshot
 *
 * @param snapshot Snapshot object
 * @param datadir Location to save to
 */
function _saveHeapSnapshot(snapshot, datadir) {
  let buffer = "";
  const stamp = Date.now();
  snapshot.serialize(
    function iterator(data, length) {
      buffer += data;
    },
    function complete() {
      const name = stamp + ".heapsnapshot";
      fs.writeFile(datadir + "/" + name, buffer, function () {
        console.log("Heap snapshot written to " + datadir + "/" + name);
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
  _saveMemoryUsage({ rss, heapTotal, heapUsed, external }, _datadir);
}

/**
 * Saves a given memory usage
 *
 * @param { rss, heapTotal, heapUsed, external } Memory usage
 * @param datadir Location to save to
 */
function _saveMemoryUsage({ rss, heapTotal, heapUsed, external }, datadir) {
  const stamp = Date.now();
  const buffer = { rss, heapTotal, heapUsed, external };
  const name = stamp + ".memoryusage";
  fs.writeFile(datadir + "/" + name, buffer, function () {
    console.log("Memory usage written to " + datadir + "/" + name);
  });
}

/**
 * Schedule a dump by the end of next tick
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
module.exports.init = function (datadir, interval = 500) {
  _datadir = datadir;
  setInterval(nextTickDump, interval);
};
