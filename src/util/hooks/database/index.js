import Waterline, { Collection } from "waterline";
import _ from "lodash";
import WaterlineUtils from "waterline-utils";
import sailsDiskAdapter from "sails-disk";
import { generateModelsFromFiles } from "./helper/models/builder";

/**
 * getDatabase
 * @param {*} opts
 */
export const getDatabase = async (opts = {}) => {
  // console.log("getDatabase(opts), opts=", opts);
  let datastores, adapters, defaultModelSettings;
  if (typeof opts !== "object") {
    throw new Error(
      "Configuration Options for Waterline Database must be of type object {}"
    );
  }

  // if (opts["datastores"]) {
  datastores = _.defaultsDeep(
    {
      default: { adapter: "sails-disk" }
    },
    opts["datastores"] || {}
  );
  // }

  // if (opts["adapters"]) {
  adapters = _.defaultsDeep(
    {
      "sails-disk": sailsDiskAdapter
    },
    opts["adapters"] || {}
  );
  // }

  if (opts["defaultModelSettings"]) {
    defaultModelSettings = _.defaultsDeep(
      opts["defaultModelSettings"],
      {
        migrate: false
      },
      defaultModelSettings
    );
  }

  let config = {
    adapters,
    datastores,
    models: await generateModelsFromFiles(app),
    defaultModelSettings
  };

  // console.log("config: ", config);
  const orm = await new Promise((resolve, reject) => {
    // console.log(config);
    // process.exit(0);
    Waterline.start(config, (err, orm) => {
      if (err) {
        //   console.error(err);
        reject(err);
        return;
      } else {
        // console.log("orm:", orm);
        // console.log("Waterline: ", Waterline);

        if (app.env !== "production") {
          WaterlineUtils.autoMigrations(
            app.config.models.migrate,
            orm,
            function(err) {
              if (err) {
                // return done(err);
                throw new Error(err);
              }
              resolve(orm);

              // return done(undefined, orm);
            }
          );
        } else {
          if (app.config.models.migrate !== "safe") {
            console.log(
              'Your migragion config is set to "' +
                app.config.models.migrate +
                '". In production mode, the model migration is set to "safe".'
            );
          }
          resolve(orm);
        }
      }
    });
  });

  app.models = orm.collections;
  app.model = identity => {
    identity = identity.replace("", "").toLowerCase();
    return orm.collections[identity];
  };
  app.datastores = orm.datastores;
  app.waterline = orm;
  return {
    orm: orm,
    models: orm.collections,
    datastores: orm.datastores,
    model: identity => {
      identity = identity.replace("", "").toLowerCase();
      return Waterline.getModel(identity, orm);
      return waterlineInstance.collections[identity];
    }
  };
};

export default getDatabase;
