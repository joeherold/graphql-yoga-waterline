import express from "express";
import { ApolloServer, gql } from "apollo-server-express";
import { makeExecutableSchema } from "graphql-tools";
import { importSchema } from "graphql-import";
import {
  applyMiddleware as applyFieldMiddleware,
  FragmentReplacement
} from "graphql-middleware";
import { deflate } from "graphql-deduplicator";

import fs from "fs";

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

    this.express = express();
    this.server = null;
    this.start = this.start.bind(this);

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

      const uploadMixin = typeDefsString.includes("scalar Upload")
        ? { Upload: GraphQLUpload }
        : {};

      this.executableSchema = makeExecutableSchema({
        directiveResolvers,
        schemaDirectives,
        typeDefs: typeDefsString,
        resolvers: Array.isArray(resolvers)
          ? [uploadMixin, ...resolvers]
          : [uploadMixin, resolvers],

        resolverValidationOptions
      });

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

    const apolloServerConfig = {
      formatResponse: response => {
        if (response.data && !response.data.__schema) {
          return deflate(response);
        }

        return response;
      },
      introspection: true,
      typeDefs: gql`
        ${this.typeDefs.join("\n")}
      `,
      schema: this.executableSchema,
      resolvers: this.resolvers,
      context,
      middlewares: this.middlewares,

      //
      // endpointUrl: options.enpoint,
      cors: options.cors,

      playground: options.playground
        ? {
            endpoint: options.endpoint + options.playground,
            query: options.defaultPlaygroundQuery,
            settings: {
              // "editor.theme": "light",
              "request.credentials": "include"
            }
            // tabs: [
            //   {
            //     endpoint: options.playground,
            //     query: options.defaultPlaygroundQuery
            //   }
            // ]
          }
        : false,

      // playground: options.playground ? options.playground : false,

      tracing: options.tracing,
      subscriptions: options.subscriptions
    };
    // console.log("apolloServerConfig", apolloServerConfig);
    const server = new ApolloServer(apolloServerConfig);

    // console.log(this.express);

    server.applyMiddleware({
      app: this.express,
      path: options.endpoint,
      cors: options.cors,
      // gui: options.playground
      //   ? {
      //       endpoint: options.playground,
      //       query: options.defaultPlaygroundQuery,
      //       settings: {
      //         // "editor.theme": "light",
      //         "request.credentials": "include"
      //       }
      //       // tabs: [
      //       //   {
      //       //     endpoint: options.playground,
      //       //     query: options.defaultPlaygroundQuery
      //       //   }
      //       // ]
      //     }
      //   : false,
      bodyParserConfig: options.bodyParserConfig
    });

    this.express.listen({ port: options.port }, result => {
      if (process.env.NODE_ENV !== "production") {
        console.log("ApolloServer booted: \n", server);
      }
      if (callback) {
        // console.log("callback defined...");
        callback(server);
      }
    });
  }
}

function mergeTypeDefs(typeDefs) {
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

function isDocumentNode(node) {
  return node && node.kind && node.kind === "Document";
}
