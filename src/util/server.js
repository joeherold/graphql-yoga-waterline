// entry file
import { GraphQLServer } from "graphql-yoga";

import prepareExpress from "./hooks/express";
import path from "path";
import fs from "fs";
import _ from "lodash";

import OKGGraphQLScalars, {
  OKGScalarDefinitions
} from "@okgrow/graphql-scalars";

import { getDatabase } from "./hooks/database";
import { getSchemaFromModels } from "./hooks/graphql/schema-generator";
import configReader from "./hooks/environment/config-reader";
import parseArgs from "./hooks/environment/args";
import ensureFilestructure from "./hooks/files/filestructure";
import { getPolicies } from "./hooks/shields";
import { shield } from "../util/shield";
import applyCors from "./hooks/cors";
import args from "./hooks/environment/args";

const rootPath = path.resolve(process.cwd());
// define the default global object
global.app = {
  debug: false,
  root: rootPath,
  processTitle: "GraphQL Waterline Server",
  env: "dev",
  config: {
    adapters: undefined,
    datastores: undefined,
    models: {
      attributes: undefined,
      migrate: "alter",
      schema: false,
      datastore: "default",
      primaryKey: "id",
      archiveModelIdentity: "archive"
    },
    bootstrap: undefined,
    settings: {
      port: 4000,
      endpoint: "/",
      subscriptions: false,
      playground: "/",
      defaultPlaygroundQuery: undefined,
      uploads: undefined,
      https: undefined,
      getEndpoint: false,
      deduplicator: true
    }
  }
};

// boot up the application as pormise
const boot = async (graphQlServerConfig = {}) => {
  // set the process name
  process.title = app.processTitle;

  // check the file Structure
  await ensureFilestructure(app.root);

  const { bootstrap } = require(path.join(app.root, "/config/bootstrap.js"));
  // execute bootstrap function
  app.config.bootstrap = bootstrap;
  // console.log(app.config.bootstrap);
  if (typeof app.config.bootstrap === "function") {
    const fnResolver = (...rest) => {
      // console.log("args: ", rest);
      if (rest.length === 0) return true;
      return rest[0];
    };
    const result = await app.config.bootstrap(fnResolver);
    if (result !== true) {
      // console.log("result of bootstrap: ", result);
      throw new Error(
        "Bootstrap function faild with error message: " +
          new Error(result).message
      );
    }
  }

  let policiesForMiddleware = await getPolicies(app);
  app["hooks"] = {};
  app.hooks["policies"] = policiesForMiddleware;

  // read in the config files
  const config = await configReader(app);

  app.config = _.defaultsDeep(config, app.config);

  // console.log(app.config.policies.rules);
  let shieldMiddleware = shield(app.config.policies.rules, {
    allowExternalErrors: app.config.policies.allowExternalErrors,
    debug: app.config.policies.debug,
    fallbackRule: app.config.policies.fallbackRule,
    fallbackError: app.config.policies.fallbackError
  });

  // console.log(shieldMiddleware);

  // parse Environment and cli params
  parseArgs(app);

  // console.log(app);
  let dbConfig = {
    adapters: app.config.adapters,
    datastores: app.config.datastores,
    defaultModelSettings: app.config.models
  };

  // console.log(dbConfig);
  const db = await getDatabase(dbConfig);

  if (app.env == "dev") {
    const schema = await getSchemaFromModels(db.models);
    fs.writeFileSync(path.join(app.root, "api/schema/models.graphql"), schema);
  }

  // const genTypeDefs = path.join(app.root, "api/schema.generated.graphql");
  const genTypeDefs = fs.readFileSync(
    path.join(app.root, "api/schema/models.graphql"),
    "utf8"
  );

  const typeDefs = fs.readFileSync(
    path.join(app.root, "api/schema/schema.graphql"),
    "utf8"
  );

  // init the application
  let resolvers = require(path.join(app.root, "api/resolvers"));

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
    middlewares: [shieldMiddleware]
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
    // schema not supported yet
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

  const server = new GraphQLServer(qlConfig);

  // add cookie parser
  prepareExpress(server.express, app);

  server["db"] = db;
  server["waterline"] = db;
  server["orm"] = db;
  server["boot"] = bootParams =>
    new Promise((resolve, reject) => {
      // we check for cors settings
      if (app.config.scerurity["cors"]) {
        app.config.settings = applyCors(app, app.config.scerurity.cors);
      }

      if (bootParams) {
        expresServerBootSettings = _.defaultsDeep(
          bootParams,
          app.config.settings
        );

        // we recheck params, not to be overwritten...
      }
      parseArgs(app);

      // parse cors options

      server.start(app.config.settings, () => {
        resolve({
          port: (() => app.config.settings.port)(),
          server: server,
          express: server.express,
          graphQlConfig: qlConfig,
          bootConfig: app.config.settigs,
          app: app
        });
      });
    });
  return server;
};
export default boot;
