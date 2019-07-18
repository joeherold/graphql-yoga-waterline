import express from "express";
const http = require("http");
import { ApolloServer, gql, PubSub } from "apollo-server-express";
import { printSchema } from "@apollo/federation";
import { importSchema } from "graphql-import";
import { buildFederatedSchema } from "@apollo/federation";
import {
  applyMiddleware as applyFieldMiddleware,
  FragmentReplacement
} from "graphql-middleware";
import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  defaultMergedResolver
} from "graphql-tools";
import { deflate } from "graphql-deduplicator";
import _ from "lodash";
import fs from "fs";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { execute, subscribe } from "graphql";
// https://github.com/prisma/graphql-yoga/blob/master/src/index.ts

/**
 * GraphQLServer based on the usage of grapql-yoga
 */
export default class GraphQLServer {
  //
  constructor(props) {
    this.typeDefs = props.typeDefs;
    this.resolvers = props.resolvers;
    this.context = props.context;

    this.middlewares = props.middlewares;

    this.resolverValidationOptions = undefined;
    this.mocks = undefined;
    this.schemaDirectives = undefined;

    this.pubsub = new PubSub();

    // this.express = express();

    // check if express instance is given..
    if (props["express"] && typeof props["express"] === "function") {
      this.express = props["express"];
    } else {
      this.express = express();
    }

    this.server = null;
    // this.start = this.start.bind(this);

    if (props.schema) {
      this.executableSchema = props.schema;
    } else if (props.typeDefs && props.resolvers) {
      const {
        directiveResolvers,
        schemaDirectives,
        resolvers,
        resolverValidationOptions,
        typeDefs,
        mocks
      } = props;

      const typeDefsString = mergeTypeDefs(typeDefs);

      // console.log("typeDefsString", typeDefsString);

      const uploadMixin = typeDefsString.includes("scalar Upload")
        ? {
            Upload: GraphQLUpload
          }
        : {};

      const resolversStack = Array.isArray(resolvers)
        ? [uploadMixin, ...resolvers]
        : [uploadMixin, resolvers];

      // We allow passing in an array of resolver maps, in which case we merge them
      const resolverMap = Array.isArray(resolversStack)
        ? resolversStack
            .filter(resolverObj => typeof resolverObj === "object")
            .reduce(mergeDeep, {})
        : resolversStack;

      // console.log("resolverMap:\n", resolverMap);
      // We allow passing in an array of resolver maps, in which case we merge them

      this.executableSchema = buildFederatedSchema([
        {
          directiveResolvers,
          schemaDirectives,
          typeDefs: gql`
            ${typeDefsString}
          `,
          resolvers: resolverMap,

          resolverValidationOptions
        }
      ]);

      // this.executableSchema = buildFederatedSchema([
      //   {
      //     typeDefs: gql`
      //       ${typeDefsString}
      //     `,
      //     resolvers: resolvers
      //   }
      // ]);

      // this.executableSchemaOld = makeExecutableSchema({
      //   directiveResolvers,
      //   schemaDirectives,
      //   typeDefs: typeDefsString,
      //   resolvers: Array.isArray(resolvers)
      //     ? [uploadMixin, ...resolvers]
      //     : [uploadMixin, resolvers],

      //   resolverValidationOptions
      // });

      if (mocks) {
        addMockFunctionsToSchema({
          schema: this.executableSchema,
          mocks: typeof mocks === "object" ? mocks : undefined,
          preserveResolvers: false
        });
      }
    }

    if (props.middlewares) {
      const { schema, fragmentReplacements } = applyFieldMiddleware(
        this.executableSchema,
        ...props.middlewares
      );

      this.executableSchema = schema;
      this.middlewareFragmentReplacements = fragmentReplacements;
    }
  }
  async start(options, callback) {
    // console.log("start with options: ", options);
    // console.log("typdefs: ", this.typeDefs);
    // console.log("context: ", this.context);
    // console.log("start with options: ", options);
    let context;
    let contextFn = async ctxArgs => {
      const fnContext = await this.context({
        req: ctxArgs.req,
        res: ctxArgs.res,
        request: ctxArgs.req,
        response: ctxArgs.res,
        fragmentReplacements: this.middlewareFragmentReplacements
      });

      const newFnContect = {
        ...ctxArgs,
        ...fnContext
      };
      // console.log("ctxArgs (newFnContect): ", newFnContect);
      // console.log("req: ", ctxArgs.req);
      // console.log("res: ", ctxArgs.res);
      return newFnContect;
    };
    try {
      context =
        typeof this.context === "function" ? await contextFn : this.context;
    } catch (e) {
      console.error(e);
      throw e;
    }
    try {
      //

      const apolloServerConfig = {
        formatResponse: response => {
          if (response.data && !response.data.__schema) {
            return deflate(response);
          }

          return response;
        },
        introspection: true,
        schema: this.executableSchema,
        // typeDefs: gql`
        //   ${this.typeDefs.join("\n")}
        // `,
        // resolvers: this.resolvers,
        context,
        middlewares: this.middlewares,

        //
        // endpointUrl: options.enpoint,
        cors: options.cors,
        // playground: true,
        playground: getPlaygroundOptions(options.playground),

        // playground: options.playground ? options.playground : false,

        tracing: options.tracing,
        subscriptions: true
        // subscriptions: options.subscriptions
        // subscriptions: {
        //   path: "/subscriptions",
        //   onConnect: async (connectionParams, webSocket, context) => {
        //     console.log(
        //       `Subscription client connected using Apollo server's built-in SubscriptionServer.`
        //     );
        //     console.log("connectionParams: ", connectionParams);
        //     // console.log("webSocket: ", webSocket);
        //     // console.log("context: ", context);
        //   },
        //   onDisconnect: async (webSocket, context) => {
        //     console.log(`Subscription client disconnected.`);
        //     console.log(webSocket, context);
        //   }
        // }
      };
      // console.log("apolloServerConfig", apolloServerConfig);
      const server = new ApolloServer(apolloServerConfig);

      // console.log("server: ", server);

      server.applyMiddleware({
        app: this.express,
        path: options.endpoint,
        cors: options.cors,
        bodyParserConfig: options.bodyParserConfig
      });

      this.express.use("/test", function(req, res, next) {
        return res.json({
          test: "hello"
        });
      });

      const schemaForWs = this.executableSchema;
      // console.log("schemaForWs: ", schemaForWs);
      const httpServer = http.createServer(this.express);
      server.installSubscriptionHandlers(httpServer);

      httpServer.listen({ port: options.port }, result => {
        // new SubscriptionServer(
        //   {
        //     execute,
        //     subscribe,
        //     schema: schemaForWs
        //   },
        //   {
        //     server: httpServer,
        //     path: "/graphql"
        //   }
        // );
        if (process.env.NODE_ENV !== "production") {
          // console.log("ApolloServer booted: \n", server);
        }
        if (callback) {
          // console.log("callback defined...");
          return callback(server);
        } else {
          return server;
        }
      });
    } catch (err) {
      console.error(err);
      //
    }
  }
}

/**
 * mergeTypeDefs
 * @param {*} typeDefs
 */
function mergeTypeDefs(typeDefs) {
  // console.log("typeDefs", typeDefs);
  if (typeof typeDefs === "string") {
    if (typeDefs.endsWith("graphql")) {
      const schemaPath = path.resolve(typeDefs);

      if (!fs.existsSync(schemaPath)) {
        throw new Error(`No schema found for path: ${schemaPath}`);
      }

      return importSchema(schemaPath);
    } else {
      return typeDefs;
    }
  }

  if (typeof typeDefs === "function") {
    typeDefs = typeDefs();
  }

  if (isDocumentNode(typeDefs)) {
    return print(typeDefs);
  }

  if (Array.isArray(typeDefs)) {
    return typeDefs.reduce((acc, t) => acc + "\n" + mergeTypeDefs(t), "");
  }

  throw new Error(
    "Typedef is not string, function, DocumentNode or array of previous"
  );
}

/**
 * isDocumentNode
 * @param {*} node
 */
function isDocumentNode(node) {
  if (!node["kind"]) {
    return false;
  }
  return node && node.kind && node.kind === "Document";
}

/**
 * getPlaygroundOptions
 * @param {*} props
 */
function getPlaygroundOptions(props) {
  let playgroundDefaultOptions = {
    // tabs: [
    //   {
    //     endpoint: options.playground,
    //     query: options.defaultPlaygroundQuery
    //   }
    // ]
    workspaceName: "TEST",
    settings: {
      // "editor.cursorShape": "line", // possible values: 'line', 'block', 'underline'
      // "editor.fontFamily": `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
      // "editor.fontSize": 14,
      // "editor.reuseHeaders": true, // new tab reuses headers from last tab
      // "editor.theme": "dark", // possible values: 'dark', 'light'
      // "general.betaUpdates": false,
      // "prettier.printWidth": 80,
      // "prettier.tabWidth": 2,
      // "prettier.useTabs": false,
      "request.credentials": "include" // possible values: 'omit', 'include', 'same-origin'
      // "schema.polling.enable": true, // enables automatic schema polling
      // "schema.polling.endpointFilter": host ? `*${host}*` : `*localhost*` // endpoint filter for schema polling
      // "schema.polling.interval": 2000, // schema polling interval in ms
      // "schema.disableComments": false, // true of false
      // "tracing.hideTracingResponse": true
    }
  };

  // console.log("getPlaygroundOptions", props, playgroundDefaultOptions);
  if (process.NODE_ENV == "production") {
    return playgroundDefaultOptions;
  }
  if (typeof props === "string" && props !== "false" && props !== "FALSE") {
    return playgroundDefaultOptions;
  }
  if (props === true || props === "true" || props === "TRUE") {
    return playgroundDefaultOptions;
  } else if (props === false || props === "false" || props === "FALSE") {
    return false;
  } else if (typeof props === "object") {
    if (props["endpoint"]) delete props["endpoint"];
    if (props["subscriptionEndpoint"]) delete props["subscriptionEndpoint"];
    // return playgroundDefaultOptions;
    return _.defaultsDeep({}, playgroundDefaultOptions, props);
  } else {
    return false;
  }
}

function mergeDeep(target, source) {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}
