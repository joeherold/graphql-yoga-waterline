import normalizeModelDefs from "./normalizer";
import glob from "glob";
import path from "path";
export const generateModelsFromFiles = async () => {
  // placeholder for model instantiation values

  let validatedModels = {};
  // load all models into the scope
  // therefore we glob over the file and store the paths in an
  // files array
  const files = await new Promise((resolve, reject) => {
    glob(path.join(app.root, "/api/models/*.js"), (err, files) => {
      if (err) {
        reject(err);
      }
      if (files) {
        resolve(files);
      }
    });
  });

  // next we have to iterate over the files
  for (let file of files) {
    // get basic file infos
    const fileName = path.basename(file, ".js");
    // const fileLocation = path.dirname(file);

    // generate an identity
    let identity = fileName.toLowerCase();

    //

    let readModel = require(file);

    // if ES6 export default and ES5 module.exports are mixed, we check it here
    if (
      readModel.hasOwnProperty("default") &&
      Object.keys(readModel).length === 1
    ) {
      readModel = readModel["default"];
    }

    // if a user has given an identity, we remove it
    if (readModel["identity"]) {
      delete readModel["identity"];
      // identity = "" + readModel["identity"];
    }

    // validatedModels[identity] = readModel; //{ ...readModel };

    validatedModels[identity] = normalizeModelDefs(readModel); //{ ...readModel };
  }

  return validatedModels;
};

export const defaultModelDefinition = {
  attributes: {},
  migrate: "alter",
  schema: false,
  datastore: "default",
  primaryKey: "id",
  archiveModelIdentity: "archive" // String braor Boolean
};
export default generateModelsFromFiles;
