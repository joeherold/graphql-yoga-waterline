import { createGlobals } from "../util/hooks/globals";
import { parseArgs, parseEnvArgs } from "../util/hooks/environment/args";
import { configReader } from "../util/hooks/environment/config-reader";
import path from "path";

/**
 * determine the root path of the application
 */
let rootPath = path.resolve(process.cwd());
try {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  const packageJson = require(packageJsonPath);
  // console.log(packageJson);
  console.log(
    "\nRunnig Dawnship-CLI against: ",
    packageJson.name + "@" + packageJson.version
  );
  // // throw new Error("package json");

  if (
    packageJson &&
    packageJson["graphql-yoga-waterline"] &&
    packageJson["graphql-yoga-waterline"]["customRootPath"]
  ) {
    rootPath = path.join(
      process.cwd(),
      packageJson["graphql-yoga-waterline"]["customRootPath"]
    );

    console.log(
      "Using custom root path: ",
      packageJson["graphql-yoga-waterline"]["customRootPath"]
    );
  } else {
    console.log("\nUsing app root as root path");
  }
} catch (e) {
  throw new Error("Erro in reading in custom configurations via package json");
}

/**
 * first generate the globals variable;
 */
let dawnship = createGlobals(rootPath, "@dawnship/server");

/**
 * parse Environment and cli param
 */
const env = parseEnvArgs(dawnship);

// read in the config files
export const config = configReader(dawnship);
dawnship.env = env;
