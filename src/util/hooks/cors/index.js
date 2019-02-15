import _ from "lodash";

const applyCors = (app, corsOptions) => {
  if (app.config.security.cors) {
    corsOptions = _.defaultsDeep(app.config.security.cors, corsOptions);
    app.config.settings.cors = { ...corsOptions };
  }
  return corsOptions;
};

export default applyCors;
