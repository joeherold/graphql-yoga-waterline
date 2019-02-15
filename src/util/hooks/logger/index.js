import { red, blue, green } from "cli-color";
import { inspect } from "util";

function localInspect(data) {
  return data.map(item => inspect(item, true, 99, true));
}

// var log = console.log;
// console.log = function() {
//   log.apply(console, arguments);
//   console.trace();
// };

export function log(...args) {
  console.log(green("INFO: "), ...args);
  // const spreader = localInspect(args);
  // console.log();
  // this.trace();
}

export function error(...args) {
  console.log(red("ERROR: "), ...args);
  // const spreader = localInspect(args);
  // console.error(...spreader);
}
export function warn(...args) {
  console.log(red("WARN: "), ...args);
  // const spreader = localInspect(args);
  // console.error(...spreader);
}

export function debug(...args) {
  console.log(blue("DEBUG: "), ...args);
  // const spreader = localInspect(args);
  // console.log(...spreader);
}

export function initLogger() {
  dawnship.log = log; //.bind(this);
  dawnship.error = error; //.bind(this);
  dawnship.warn = warn; //.bind(this);
  dawnship.debug = debug; //.bind(this);
}
