import glob from "glob";
import path from "path";
import _ from "lodash";

const read = async app => {
  // console.info("\nreading config from files:\n");

  let newConfig = await new Promise(async (resolve, reject) => {
    let global_configuration = {};

    glob(path.join(app.root, "/config/**/*.js"), (err, files) => {
      if (err) {
        reject(err);
      }
      if (files) {
        for (let file of files) {
          const conf = require.resolve(file);
          let theConf = require(conf);
          if (app.debug === true) {
            console.log("\n\ntheConf of file: ", file);
            console.log(theConf);
          }
          if (!_.isEmpty(theConf)) {
            theConf = _.mapValues(theConf, val => {
              if (_.isEmpty(val)) return undefined;
              return val;
            });

            global_configuration = _.defaultsDeep(
              theConf,
              global_configuration
            );
          }

          // global_configuration = _.defaults(global_configuration, theConf); //{ ...global_configuration, ...theConf };
        }
      }
      // app.config = { ...global_configuration };
      app.config = _.defaultsDeep({ ...global_configuration }, app.config);
      resolve(app.config);
    });
  });
  // console.log(newConfig);
  return newConfig;
};

export default read;