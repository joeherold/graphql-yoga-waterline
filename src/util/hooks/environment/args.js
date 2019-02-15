const argv = require("yargs").argv;

export const parseEnvArgs = dawnship => {
  let applicationEnvironment = "development";
  if (process.env.NODE_ENV) {
    switch (process.env.NODE_ENV) {
      case "dev":
      case "development":
      case "d":
        applicationEnvironment = "development";
        break;
      case "prod":
      case "production":
      case "p":
        applicationEnvironment = "production";
        break;
      default:
        applicationEnvironment = "development";
    }
  }

  if (argv.prod) {
    applicationEnvironment = "production";
    process.env.NODE_ENV = "production";
  }
  if (argv.dev) {
    applicationEnvironment = "development";
    process.env.NODE_ENV = "development";
  }
  dawnship.env = applicationEnvironment;
  return applicationEnvironment;
};

export const parseArgs = dawnship => {
  // console.info("prsing args provided via ENV");

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

  // console.log(dawnship.config.settings);
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
      dawnship.config.settings[settingsKey] = value;
    } else if (process.env[opt.toUpperCase()]) {
      let value = normalizeBoolFromString(process.env[opt.toUpperCase()]);
      dawnship.config.settings[settingsKey] = value;
    }
  }
};
