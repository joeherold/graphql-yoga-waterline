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
  let datastores, adapters, defaultModelSettings;
  if (typeof opts !== "object") {
    throw new Error(
      "Configuration Options for Waterline Database must be of type object {}"
    );
  }
  datastores = opts["datastores"] || { default: { adapter: "sails-disk" } };
  adapters = opts["adapters"] || { "sails-disk": sailsDiskAdapter };
  defaultModelSettings = opts["defaultModelSettings"] || {};

  let config = {
    adapters,
    datastores,
    models: await generateModelsFromFiles(app),
    defaultModelSettings
  };

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

        WaterlineUtils.autoMigrations(app.config.models.migrate, orm, function(
          err
        ) {
          if (err) {
            // return done(err);
            throw new Error(err);
          }
          resolve(orm);

          // return done(undefined, orm);
        });
      }
    });
  });

  app.models = orm.collections;
  app.model = identity => {
    identity = identity.replace("Model", "").toLowerCase();
    return orm.collections[identity];
  };
  app.datastores = orm.datastores;
  app.waterline = orm;
  return {
    models: orm.collections,
    datastores: orm.datastores,
    model: identity => {
      identity = identity.replace("Model", "").toLowerCase();
      return Waterline.getModel(identity, orm);
      return waterlineInstance.collections[identity];
    }
  };
};

export default getDatabase;
