import _ from "lodash";

export const applyCors = (dawnship, corsOptions) => {
  if (dawnship.config.security.cors) {
    corsOptions = _.defaultsDeep(dawnship.config.security.cors, corsOptions);
    dawnship.config.settings.cors = { ...corsOptions };
  }
  return corsOptions;
};

export default applyCors;
