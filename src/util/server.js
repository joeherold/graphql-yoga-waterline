// entry file
import { GraphQLServer } from "graphql-yoga";

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

  // read in the config files
  const config = await configReader(app);
  app.config = _.defaultsDeep(config, app.config);

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
        db,
        getModel: db.model
      };
    },
    schemaDirectives: undefined,
    middlewares: []
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

  server["db"] = db;
  server["waterline"] = db;
  server["orm"] = db;
  server["boot"] = bootParams =>
    new Promise((resolve, reject) => {
      if (bootParams) {
        app.config.settings = _.defaultsDeep(bootParams, app.config.settings);

        // we recheck params, not to be overwritten...
        parseArgs(app);
      }
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
