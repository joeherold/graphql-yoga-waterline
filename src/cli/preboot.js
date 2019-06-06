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

  const packageJdon = require(packageJsonPath);
  // console.log(packageJdon);
  console.log(
    "\nRunnig Dawnship-CLI against: ",
    packageJdon.name + "@" + packageJdon.version
  );
  // // throw new Error("package json");

  if (
    packageJdon &&
    packageJdon["graphql-yoga-waterline"] &&
    packageJdon["graphql-yoga-waterline"]["customRootPath"]
  ) {
    rootPath = path.join(
      process.cwd(),
      packageJdon["graphql-yoga-waterline"]["customRootPath"]
    );

    console.log(
      "Using custom root path: ",
      packageJdon["graphql-yoga-waterline"]["customRootPath"]
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
