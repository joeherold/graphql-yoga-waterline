import glob from "glob";
import path from "path";

const read = async () => {
  const appRoot = process.cwd();
  let global_configuration = {};

  return await new Promise((resolve, reject) => {
    glob(path.join(process.cwd(), "/config/**/*.js"), (err, files) => {
      if (err) {
        reject(err);
      }
      if (files) {
        //   console.log(files);
        for (let file of files) {
          const conf = require.resolve(file);
          const theConf = require(conf);
          global_configuration = { ...global_configuration, ...theConf };
          // console.log(conf, theConf);
        }
        //   resolve(files);
      }
      // console.log("global_configuration", global_configuration);
      app.config = { ...global_configuration };
      resolve(app.config);
    });
  });
};

export default read;
