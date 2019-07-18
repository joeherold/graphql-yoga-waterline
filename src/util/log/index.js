import log from "loglevel";

export default log;
export const setDefaultLevel = value => {
  if (process.env.NODE_ENV === "production") {
    log.setLevel(log.levels.ERROR);
  } else {
    if (value) {
      log.setLevel(value);
    } else {
      const level = parseInt(process.env.LOG_LEVEL);

      if (level >= 0 && level <= 5) {
        log.setLevel(level || 0);
      } else {
        log.setLevel(process.env.LOG_LEVEL);
      }
    }
  }

  // console.log("level: ", log.getLevel());
};
export const setLogLevel = value => {
  const level = parseInt(process.env.LOG_LEVEL);

  if (level >= 0 && level <= 5) {
    if (level === 0) {
      // console.log = function() {};
      // console.info = function() {};
      // console.warn = function() {};
      // console.error = function() {};
    }
    if (level === 1) {
      // console.log = function() {};
      // console.info = function() {};
      // console.warn = function() {};
      // console.error = function() {};
    }
    if (level === 2) {
      console.log = function() {};
      // console.info = function() {};
      // console.warn = function() {};
      // console.error = function() {};
    }
    if (level === 3) {
      console.log = function() {};
      console.info = function() {};
      // console.warn = function() {};
      // console.error = function() {};
    }
    if (level === 4) {
      console.log = function() {};
      console.info = function() {};
      console.warn = function() {};
      // console.error = function() {};
    }
    if (level === 5) {
      console.log = function() {};
      console.info = function() {};
      console.warn = function() {};
      console.error = function() {};
    }
    setDefaultLevel(level || 0);
  } else {
    if (process.env.LOG_LEVEL === "TRACE") {
      // console.log = function() {};
      // console.info = function() {};
      // console.warn = function() {};
      // console.error = function() {};
    }
    if (process.env.LOG_LEVEL === "DEBUG") {
      // console.log = function() {};
      // console.info = function() {};
      // console.warn = function() {};
      // console.error = function() {};
    }
    if (process.env.LOG_LEVEL === "INFO") {
      console.log = function() {};
      // console.info = function() {};
      // console.warn = function() {};
      // console.error = function() {};
    }
    if (process.env.LOG_LEVEL === "WARN") {
      console.log = function() {};
      console.info = function() {};
      // console.warn = function() {};
      // console.error = function() {};
    }
    if (process.env.LOG_LEVEL === "ERROR") {
      console.log = function() {};
      console.info = function() {};
      console.warn = function() {};
      // console.error = function() {};
    }
    if (process.env.LOG_LEVEL === "SILENT") {
      console.log = function() {};
      console.info = function() {};
      console.warn = function() {};
      console.error = function() {};
    }

    setDefaultLevel(process.env.LOG_LEVEL);
  }
  // setDefaultLevel(value);
};
if (!global.log) {
  global.log = log;
  // setDefaultLevel();
}
