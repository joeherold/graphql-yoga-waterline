import glob from "glob";
import path from "path";
import _ from "lodash";

export const configReader = async dawnship => {
  // console.info("\nreading config from files:\n");

  let newConfig = await new Promise(async (resolve, reject) => {
    let global_configuration = {};

    glob(path.join(dawnship.root, "/config/**/*.js"), (err, files) => {
      if (err) {
        reject(err);
      }
      if (files) {
        for (let file of files) {
          const conf = require.resolve(file);
          let theConf = require(conf);
          if (dawnship.debug === true) {
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
      // dawnship.config = { ...global_configuration };
      dawnship.config = _.defaultsDeep(
        { ...global_configuration },
        dawnship.config
      );
      resolve(dawnship.config);
    });
  });
  // console.log(newConfig);
  return newConfig;
};

export default configReader;
