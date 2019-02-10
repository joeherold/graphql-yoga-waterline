// entry file
import { GraphQLServer } from "graphql-yoga";

import path from "path";
import fs from "fs";
import _ from "lodash";

import OKGGraphQLScalars, {
  OKGScalarDefinitions
} from "@okgrow/graphql-scalars";

import { getDatabase } from "./util/database";
import { getSchemaFromModels } from "./util/graphql/schema-generator";
import configReader from "./util/environment/config-reader";
import parseArgs from "./util/environment/args";
import ensureFilestructure from "./util/files/filestructure";

const rootPath = path.resolve(process.cwd());
global.app = {
  root: rootPath,

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

const boot = async (graphQlServerConfig = {}) => {
  process.title = "GraphQL Waterline Server";
  // console.log(app);

  const config = await configReader(app);

  app.config = _.defaultsDeep(app.config, config);
  parseArgs(app);
  // console.log(app);
  let dbConfig = {
    adapters: app.config.adapters,
    datastores: app.config.datastores,
    defaultModelSettings: app.config.models
  };

  await ensureFilestructure(app.root);

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
  let defBootOpts = _.defaultsDeep(
    {
      port: 4000,
      endpoint: "/",
      subscriptions: false,
      playground: "/",
      defaultPlaygroundQuery: undefined,
      uploads: undefined,
      https: undefined,
      getEndpoint: false,
      deduplicator: true
    },
    app.config.settings
  );

  server["db"] = db;
  server["waterline"] = db;
  server["orm"] = db;
  server["boot"] = bootParams =>
    new Promise((resolve, reject) => {
      if (bootParams) {
        defBootOpts = { ...defBootOpts, ...bootParams };
      }
      server.start(defBootOpts, () => {
        resolve(defBootOpts);
      });
    });
  return server;
};
export default boot;
