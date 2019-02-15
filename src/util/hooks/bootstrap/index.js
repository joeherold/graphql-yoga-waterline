import path from "path";

export const runHookBootstrap = async dawnship => {
  const { bootstrap } = require(path.join(
    dawnship.root,
    "/config/bootstrap.js"
  ));
  // execute bootstrap function
  dawnship.config.bootstrap = bootstrap;
  // console.log(dawnship.config.bootstrap);
  if (typeof dawnship.config.bootstrap === "function") {
    const fnResolver = (...rest) => {
      // console.log("args: ", rest);
      if (rest.length === 0) return true;
      return rest[0];
    };
    const result = await dawnship.config.bootstrap(fnResolver);
    if (result !== true) {
      // console.log("result of bootstrap: ", result);
      throw new Error(
        "Bootstrap function faild with error message: " +
          new Error(result).message
      );
    }
  }
  return dawnship;
};

export default runHookBootstrap;
