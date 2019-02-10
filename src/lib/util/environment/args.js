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

  if (argv.port) {
    app.config.settings.port = argv.port;
  }
  if (process.env.PORT) {
    app.config.settings.port = process.env.PORT;
  }
  if (argv.port) {
    app.config.settings.port = argv.port;
  }
  if (argv.endpoint) {
    app.config.settings.endpoint = argv.endpoint;
  }
};
