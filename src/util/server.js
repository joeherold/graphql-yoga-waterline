// entry file

import { GraphQLServer } from "graphql-yoga";
import { weaveSchemas } from "graphql-weaver";
import prepareExpress from "./hooks/express";
import path from "path";
import fs, { exists } from "fs";
import _ from "lodash";

// import { makeExecutableSchema, mergeSchemas } from "graphql-tools";

import OKGGraphQLScalars, {
  OKGScalarDefinitions
} from "@okgrow/graphql-scalars";

/**
 * IMPORT ALL HOOKS
 */
import { getDatabase } from "./hooks/database";
import { runHookBootstrap } from "./hooks/bootstrap";
import { getSchemaFromModels } from "./hooks/graphql/schema-generator";
import { configReader } from "./hooks/environment/config-reader";
import { parseArgs, parseEnvArgs } from "./hooks/environment/args";
import { ensureFilestructure } from "./hooks/files/filestructure";
import { getPolicies } from "./hooks/shields";
import { applyCors } from "./hooks/cors";
import { createGlobals } from "./hooks/globals";
import { initLogger } from "./hooks/logger";
const bootMessage = [
  "      _                          _     _       ",
  "     | |                        | |   (_)      ",
  "   __| | __ ___      ___ __  ___| |__  _ _ __ ",
  "  / _` |/ _`   / / / '_ / __| '_ | | '_  ",
  " | (_| | (_| | V  V /| | | __  | | | | |_) |",
  "  \\__,_|__,_| _/_/ |_| |_|___/_| |_|_| .__/ ",
  "                                      | |    ",
  "                                      |_|    "
];
/**
 * IMPORT SHIELD
 */
import { shield } from "../util/shield";

import {
  makeExecutableSchema,
  mergeSchemas,
  makeRemoteExecutableSchema,
  transformSchema,
  RenameTypes
} from "graphql-tools";

// export const YogaGraphQLServer = GraphQLServer;

// boot up the application as pormise
const boot = async (
  graphQlServerConfig = {},
  customRootPath = undefined,
  CustomYogaImport
) => {
  /**
   * determine the root path of the application
   */
  const rootPath = customRootPath || path.resolve(process.cwd());

  /**
   * first generate the globals variable;
   */
  let dawnship = createGlobals(rootPath, "@dawnship/server");

  /**
   * parse Environment and cli param
   */
  const env = parseEnvArgs(dawnship);
  dawnship.env = env;

  /**
   * INIT LOGGER
   */
  initLogger();

  /**
   * print logo to cli
   */
  if (dawnship.env !== "production") {
    for (let line of bootMessage) {
      console.log(line);
    }
  }

  /**
   * set the process name
   */
  process.title = dawnship.processTitle;

  /**
   * check the file Structure
   */

  await ensureFilestructure(dawnship);

  /**
   * apply bootstrap
   */
  await runHookBootstrap(dawnship);

  let policiesForMiddleware = await getPolicies(dawnship);

  dawnship["hooks"] = {};
  dawnship.hooks["policies"] = policiesForMiddleware;

  // read in the config files
  const config = await configReader(dawnship);

  dawnship.config = _.defaultsDeep(config, dawnship.config);

  // console.log(dawnship.config.policies.rules);
  let shieldMiddleware = undefined;
  if (
    dawnship.config.policies.rules &&
    dawnship.config.policies.rules.length > 0
  ) {
    shieldMiddleware = shield(dawnship.config.policies.rules, {
      allowExternalErrors: dawnship.config.policies.allowExternalErrors,
      debug: dawnship.config.policies.debug,
      fallbackRule: dawnship.config.policies.fallbackRule,
      fallbackError: dawnship.config.policies.fallbackError
    });
  }
  // console.log(shieldMiddleware);

  // parse Environment and cli params
  parseArgs(dawnship);

  // console.log(dawnship);
  let dbConfig = {
    adapters: dawnship.config.adapters,
    datastores: dawnship.config.datastores,
    defaultModelSettings: dawnship.config.models
  };

  // console.log(dbConfig);
  const db = await getDatabase(dbConfig);

  if (dawnship.env !== "production") {
    const schema = await getSchemaFromModels(db.models);
    fs.writeFileSync(
      path.join(dawnship.root, "api/schema/models.graphql"),
      schema
    );
  }

  // const genTypeDefs = path.join(dawnship.root, "api/schema.generated.graphql");
  const genTypeDefs = fs.readFileSync(
    path.join(dawnship.root, "api/schema/models.graphql"),
    "utf8"
  );

  const typeDefs = fs.readFileSync(
    path.join(dawnship.root, "api/schema/schema.graphql"),
    "utf8"
  );

  // init the application
  let resolvers = require(path.join(dawnship.root, "api/resolvers"));

  // add cors middleware

  let default_graphQlServerConfig = {
    typeDefs: [...OKGScalarDefinitions, genTypeDefs + "\n" + typeDefs],
    resolvers: {
      ...OKGGraphQLScalars,
      ...resolvers
    },
    resolverValidationOptions: undefined,
    // schema: null, // not supported yet...
    mocks: undefined,
    context: req => {
      return {
        ...req,
        req: req.request,
        res: req.response,
        db,
        getModel: db.model
      };
    },
    schemaDirectives: undefined,
    middlewares: shieldMiddleware ? [shieldMiddleware] : []
  };

  let qlConfig = {
    typeDefs: [
      ...default_graphQlServerConfig.typeDefs,
      ...(graphQlServerConfig.typeDefs || [])
    ],
    resolvers: {
      ...default_graphQlServerConfig.resolvers,
      ...(graphQlServerConfig.resolvers || {})
    },
    resolverValidationOptions:
      graphQlServerConfig.resolverValidationOptions || undefined,

    mocks: graphQlServerConfig.mocks || undefined,
    context: attr => {
      if (typeof graphQlServerConfig.context === "function") {
        return default_graphQlServerConfig.context(
          graphQlServerConfig.context(attr)
        );
      } else if (typeof graphQlServerConfig.context === "object") {
        return default_graphQlServerConfig.context({
          ...attr,
          ...graphQlServerConfig.context
        });
      } else {
        return default_graphQlServerConfig.context(attr);
      }
    },

    schemaDirectives: graphQlServerConfig.schemaDirectives || undefined,
    middlewares: [
      ...default_graphQlServerConfig.middlewares,
      ...(graphQlServerConfig.middlewares || [])
    ]
  };

  const BuildHandlerClass =
    CustomYogaImport && CustomYogaImport.GraphQLServer
      ? CustomYogaImport.GraphQLServer
      : GraphQLServer;

  let server = new BuildHandlerClass(qlConfig);

  // const mergeS = (qlConfig);
  if (graphQlServerConfig.remoteSchemas) {
    // qlConfig.typeDefs = undefined;
    // qlConfig.resolvers = undefined;
    // qlConfig.schemaDirectives = undefined;
    // qlConfig.middlewares = undefined;
    // const schema_1 = server.executableSchema;
    // const schema_2 = graphQlServerConfig.remoteSchemas;
    // console.log("SCHEMA 1", schema_1);
    // console.log("SCHEMA 2", schema_2);
    // try {
    //   const onTypeConflict = (left, right, info) => {
    //     if (info.left.schema.version >= info.right.schema.version) {
    //       return left;
    //     } else {
    //       return right;
    //     }
    //   };
    //   const newSchema = mergeSchemas({
    //     schemas: [schema_2],
    //     onTypeConflict: onTypeConflict
    //     // resolvers: qlConfig.resolvers
    //   });
    // } catch (e) {
    //   console.log("error:", e);
    // }

    // console.log(newSchema);
    // console.log("schema_1", schema_1);
    // // const schema_2 = graphQlServerConfig.schema;
    // // console.log("schema_2", schema_2);
    // // let arrSchemas = [schema_1, schema_2];
    // const newSchema = await weaveSchemas({
    //   endpoints: [
    //     ...graphQlServerConfig.remoteSchemas.endpoints,
    //     {
    //       namespace: "local",
    //       schema: schema_1
    //     }
    //   ]
    // });
    // // consolelog("newSchema", newSchema);
    server = new BuildHandlerClass({
      ...qlConfig,
      schema: schema_1
      // middlewares: null
    });
  }

  // console.log(server.executableSchema);
  // console.log(
  //   mergeSchemas({
  //     schemas: [server.executableSchema, graphQlServerConfig.schema]
  //   })
  // );

  // add cookie parser
  prepareExpress(server.express, dawnship);

  server["db"] = db;
  server["waterline"] = db;
  server["orm"] = db;
  server["boot"] = bootParams =>
    new Promise((resolve, reject) => {
      // we check for cors settings
      if (dawnship.config.security && dawnship.config.security["cors"]) {
        dawnship.config.settings["cors"] = applyCors(
          dawnship,
          dawnship.config.security.cors
        );
      }

      if (bootParams) {
        dawnship.config.settings = _.defaultsDeep(
          bootParams,
          dawnship.config.settings
        );

        // we recheck params, not to be overwritten...
      }
      parseArgs(dawnship);

      // parse cors options

      server.start(dawnship.config.settings, () => {
        resolve({
          port: (() => dawnship.config.settings.port)(),
          server: server,
          express: server.express,
          graphQlConfig: qlConfig,
          bootConfig: dawnship.config.settigs,
          app: dawnship
        });
      });
    });
  return server;
};
export default boot;
