const argv = require("yargs").argv;
export default app => {
  // console.info("prsing args provided via ENV");
  let nodEnv = "dev";
  if (process.env.NODE_ENV) {
    switch (process.env.NODE_ENV) {
      case "dev":
      case "development":
      case "d":
        nodEnv = "development";
        break;
      case "prod":
      case "production":
      case "p":
        nodEnv = "production";
      default:
        nodEnv = "development";
    }
  }

  if (argv.prod) {
    nodEnv = "production";
  }
  if (argv.dev) {
    nodEnv = "dev";
  }

  const normalizeBoolFromString = value => {
    switch (value) {
      case "TRUE":
      case "True":
      case "true":
      case "1":
        value = true;
        break;
      case "FALSE":
      case "False":
      case "false":
      case "0":
        value = false;
        break;
      default:
    }
    return value;
  };

  // console.log(app.config.settings);
  const possibleOverwrite = [
    "tracing",

    "port",
    "p",

    "endpoint",
    "e",

    "subscriptions",

    "playground",
    "pe",

    "defaultPlaygroundQuery",

    "getEndpoint",

    "deduplicator"
  ];
  for (let opt of possibleOverwrite) {
    let settingsKey = opt;
    if (argv[opt]) {
      if (opt == "p") {
        settingsKey = "port";
      }
      if (opt == "e") {
        settingsKey = "endpoint";
      }
      if (opt == "pe") {
        settingsKey = "playground";
      }
      let value = normalizeBoolFromString(argv[opt]);
      app.config.settings[settingsKey] = value;
    } else if (process.env[opt.toUpperCase()]) {
      let value = normalizeBoolFromString(process.env[opt.toUpperCase()]);
      app.config.settings[settingsKey] = value;
    }
  }
};
