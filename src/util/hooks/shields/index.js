import glob from "glob";
import path from "path";
import _ from "lodash";
import { rule } from "../../shield";

const getShieldPoliciesConfig = async () => {};
const getShieldPolicies = async () => {};

export const getPolicies = async app => {
  let policies = await new Promise(async (resolve, reject) => {
    glob(path.join(app.root, "/api/policies/*.js"), (err, files) => {
      let rules = {};
      if (err) {
        reject(err);
      }
      if (files) {
        // console.log(files);
        for (let file of files) {
          let filename = path.basename(file, ".js");
          let mod = require(file);
          //   console.log("typeof mod: ", typeof mod);
          //   console.log("mod: ", mod);
          if (typeof mod === "function") {
            rules[filename] = rule()(mod);
          } else if (
            _.isObject(mod) &&
            mod["rule"] &&
            typeof mod["rule"] === "function"
          ) {
            let cache = "no_cache";
            if (mod["cache"] !== undefined) {
              cache = mod.cache;
            }

            rules[filename] = rule({ cache })(mod["rule"]);
          } else {
            continue;
          }
        }
        resolve(rules);
      }
    });
  });
  //   console.log(policies);
  return policies;
};
