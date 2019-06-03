import { createGlobals } from "../util/hooks/globals";
import { parseArgs, parseEnvArgs } from "../util/hooks/environment/args";
import { configReader } from "../util/hooks/environment/config-reader";
import path from "path";

/**
 * determine the root path of the application
 */
const rootPath = path.resolve(process.cwd());
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
