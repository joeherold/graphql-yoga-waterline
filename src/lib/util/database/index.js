import Waterline, { Collection } from "waterline";
import { normalizeModelDefs } from "./normalize";
import glob from "glob";
import path from "path";

import sailsDiskAdapter from "sails-disk";

export const getDatabase = async opts => {
  let datastores, adapters, defaultModelSettings;
  if (opts) {
    if (opts["datastores"]) {
      datastores = opts["datastores"];
    }
    if (opts["adapters"]) {
      adapters = opts["adapters"];
    }
    if (opts["defaultModelSettings"]) {
      defaultModelSettings = opts["defaultModelSettings"];
    }
  }

  // const waterline = new Waterline();

  // load all models into the scope
  const files = await new Promise((resolve, reject) => {
    glob(path.join(app.root, "/api/models/*Model.js"), (err, files) => {
      if (err) {
        reject(err);
      }
      if (files) {
        resolve(files);
      }
    });
  });

  // placeholder for model instantiation values
  const models = {};
  let extendedModels = {};

  if (files) {
    for (let file of files) {
      //   console.log(file);
      const afile = path.basename(file, ".js");
      // console.log(afile);
      const aFileLocation = path.dirname(file);
      let identity = afile.replace("Model", "").toLowerCase();
      let tmp = require(file);
      if (tmp.hasOwnProperty("default") && Object.keys(tmp).length === 1) {
        tmp = { ...tmp.default };
      }
      if (tmp["identity"]) {
        identity = "" + tmp["identity"];
      } else {
        throw new Error(
          `You must define a unique model idenity on property identity.
          \nFile: ${afile}.js\nLocation: ${aFileLocation.replace(
            app.root,
            ""
          )}\nLocation (abs): ${aFileLocation}\n\n`
        );
      }
      models[identity] = { ...tmp };
      // models[identity] = Collection.extend({ ...tmp });
    }
  }

  for (let modelIdentity in models) {
    // const collection = Collection.extend(models[modelIdentity]);
    extendedModels[modelIdentity] = normalizeModelDefs(models[modelIdentity]);
    // waterline.registerModel(collection);
  }

  let config = {
    adapters: {
      "sails-disk": sailsDiskAdapter,
      ...adapters
    },

    datastores: {
      default: {
        adapter: "sails-disk"
      },
      ...datastores
    },
    models: extendedModels,
    defaultModelSettings
  };
  // console.log("DB CONFIG: ", config);

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
        resolve(orm);
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
