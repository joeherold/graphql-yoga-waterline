<img title="graphql-logo" src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/512px-GraphQL_Logo.svg.png" width="auto" height="150">

# graphql-yoga-waterline

Fully-featured GraphQL Server with focus on easy setup, performance & great developer experience

## Overview

[<img title="waterline-logo" src="http://i.imgur.com/3Xqh6Mz.png" width="610px" alt="Waterline logo"/>](http://waterlinejs.org)

An easy implementation of the [graphql-yoga](https://github.com/prisma/graphql-yoga) server, but enhanced with an super easy usage of the great [Waterline ORM](http://waterlinejs.org/).

## Features

Build your Models as used with Sails.JS.
Auto Generation auf Model Schemas during Boot
Resolver Context is enhanced with Waterline ORM instance `ctx.db`
Usage or Waterline Adapters (Official and Community)

### Officially-supported database adapters

- MySQL
- PostgreSQL
- MongoDB
- Local disk / memory
- ...[see more here](https://sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters)

### Community-supported database adapters:

Is your database not supported by one of the core adapters? Good news! There are many different community database adapters for Sails.js and Waterline [available on NPM](https://www.npmjs.com/search?q=sails+adapter).

Here are a few highlights:

- Redis
- MS SQL Server
- OrientDB
- Oracle
- Oracle (AnyPresence)
- Oracle (stored procedures)
- SAP HANA DB
- SAP HANA (AnyPresence)
- IBM DB2
- ServiceNow SOAP
- Cassandra
- Solr
- FileMaker Database
- Apache Derby
- REST API (Generic)
- ...[see more here](https://sailsjs.com/documentation/concepts/extending-sails/adapters/available-adapters#communitysupported-database-adapters)

### Injection of Waterline ORM in Resolver Context

```js
// a resolver example with injected Waterline ORM
Query = {
 myResolver = async (_, args, ctx) => {
     const UserModel = ctx.db.model("User");
     return UserModel.find();
  }
}
```

### Auto generation of Model Schemas based on your Waterline Models

During the fist boot of the app, a folder structure ist created in your project root.

```text
root/
  api/
    models/
    policies/
    resolvers/
      index.js
    schema/
      models.graphql
      schema.graphql

  config/
    adapter.js
    bootstrap.js
    datastores.js
    models.js
    settings.js

  yourApp.js // this file is not generated
```

## Usage

The module returns a Promise. So it is easy to imolement in an asynchronus stack. Event with async / await.
the promise is resolved with: `{server, db, express}`.
So you have access to the server-instsance, de Waterline ORM and the express-application.

```js
const yogaServer = require("graphql-yoga-waterline");

// use async / await for more easy reading
(async () => {
  // config für gql
  const graphQLServerOpts = {};

  // config für server
  const bootOpts = {
    endpoint: "/graphql",
    port: 4000,
    playground: false
  };
  const server = await yogaServer(graphQLServerOpts);

  // get express instance
  const express = server.express;

  // modify express instance
  express.use("/myEndpoint", (req, res) => {
    res.send("OK");
  });

  // boot the server and thet the result
  const { port } = await server.boot(bootOpts);
  console.log(`Server is running on port: ${port}`);
})();
```

### graphQlServerConfig

```js
var aContextServiceProcvoder = requrie("my-service-provider");

// for furthor information see: https://github.com/prisma/graphql-yoga#graphqlserver

let graphQLServerOpts = {
  // typeDefs: Contains GraphQL type definitions in SDL or file
  // path to type definitions (required if schema is not provided *)
  // @url: https://www.prisma.io/blog/graphql-sdl-schema-definition-language-6755bcb9ce51
  typeDefs: undefined, // String | Function | DocumentNode or array of previous

  // resolvers: Contains resolvers for the fields specified in
  // typeDefs (required if schema is not provided *)
  resolvers: undefined, // Object

  // Object which controls the resolver validation behaviour for more information
  // @url: https://www.apollographql.com/docs/graphql-tools/generate-schema.html#makeExecutableSchema
  resolverValidationOptions: undefined,

  // Applies mocks to schema. Setting this to true will apply a default mock,
  // however you can pass an object to customize the mocks similar to the resolvers map.
  // @url: https://github.com/apollographql/graphql-tools/blob/master/docs/source/mocking.md
  mocks: undefined, // Object | Boolean

  // Contains custom data being passed through your resolver chain.
  // This can be passed in as an object, or as a Function with the
  // signature (req: ContextParameters) => any *
  // IMPORTANT: db is passed to the context, as an insance of the
  // waterline ORM.
  //
  // so e.g:
  // myResolver = async (_, args, ctx) => {
  //    const UserModel = ctx.db.model("User");
  //    return UserModel.find();
  // }
  context: req => {
    return {
      ...req,
      aContextServiceProvoder
    };
  },

  // schemaDirectives: Apollo Server schema directives that allow for
  // transforming schema types, fields, and arguments
  // @url: https://www.apollographql.com/docs/graphql-tools/schema-directives.html
  schemaDirectives: undefined, // Object

  // middlewares: A list of GraphQLMiddleware middleware.
  // @url: https://github.com/prisma/graphql-middleware
  middlewares: [] // array of Middleware
};
```

The `props` argument accepts the following fields:

| Key                         | Type                                                            | Default | Note                                                                                                                                                                                                                                              |
| --------------------------- | --------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `typeDefs`                  | `String` or `Function` or `DocumentNode` or `array` of previous | `null`  | Contains GraphQL type definitions in [SDL](https://blog.graph.cool/graphql-sdl-schema-definition-language-6755bcb9ce51) or file path to type definitions (required if `schema` is not provided \*)                                                |
| `resolvers`                 | Object                                                          | `null`  | Contains resolvers for the fields specified in `typeDefs` (required if `schema` is not provided \*)                                                                                                                                               |
| `resolverValidationOptions` | Object                                                          | `null`  | Object which controls the resolver validation behaviour (see ["Generating a schema"](https://www.apollographql.com/docs/graphql-tools/generate-schema.html#makeExecutableSchema)) for more information                                            |
| `schema`                    | Object                                                          | `null`  | An instance of [`GraphQLSchema`](http://graphql.org/graphql-js/type/#graphqlschema) (required if `typeDefs` and `resolvers` are not provided \*)                                                                                                  |
| `mocks`                     | Object or Boolean                                               | `null`  | Applies [mocks to schema](https://github.com/apollographql/graphql-tools/blob/master/docs/source/mocking.md). Setting this to true will apply a default mock, however you can pass an object to customize the mocks similar to the resolvers map. |
| `context`                   | Object or Function                                              | `{}`    | Contains custom data being passed through your resolver chain. This can be passed in as an object, or as a Function with the signature `(req: ContextParameters) => any` \*\*                                                                     |
| `schemaDirectives`          | Object                                                          | `null`  | [`Apollo Server schema directives`](https://www.apollographql.com/docs/graphql-tools/schema-directives.html) that allow for transforming schema types, fields, and arguments                                                                      |
| `middlewares`               | `array` of Middleware                                           | `[]`    | A list of [`GraphQLMiddleware`](https://github.com/graphcool/graphql-middleware) middleware.                                                                                                                                                      |

> (\*) **!! YET NOT SUPPORTED !!** , but when supported, there are two major ways of providing the [schema](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e) information to the `constructor`:
>
> 1.  Provide `typeDefs` and `resolvers` and omit the `schema`, in this case `graphql-yoga` will construct the `GraphQLSchema` instance using [`makeExecutableSchema`](https://www.apollographql.com/docs/graphql-tools/generate-schema.html#makeExecutableSchema) from [`graphql-tools`](https://github.com/apollographql/graphql-tools).
> 2.  Provide the `schema` directly and omit `typeDefs` and `resolvers`.

> (\*\*) Notice that the `req` argument is an object of the shape `{ request, response, connection }` which either carries a `request: Request` property (when it's a `Query`/`Mutation` resolver), `response: Response` property (when it's a `Query`/`Mutation` resolver), or a `connection: SubscriptionOptions` property (when it's a `Subscription` resolver). [`Request`](http://expressjs.com/en/api.html#req) is imported from Express.js. [`Response`](http://expressjs.com/en/api.html#res) is imported from Express.js aswell. `SubscriptionOptions` is from the [`graphql-subscriptions`](https://github.com/apollographql/graphql-subscriptions) package. `SubscriptionOptions` are getting the `connectionParams` automatically injected under `SubscriptionOptions.context.[CONNECTION_PARAMETER_NAME]`

### bootOpts

The `bootOpts` object has the following fields:

| Key                      | Type                                                             | Default                                                                                          | Note                                                                                                                                                                                                                                                                                                                         |
| ------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cors`                   | Object                                                           | `null`                                                                                           | Contains [configuration options](https://github.com/expressjs/cors#configuration-options) for [cors](https://github.com/expressjs/cors)                                                                                                                                                                                      |
| `tracing`                | Boolean or [TracingOptions](/src/types.ts#L49-L51)               | `'http-header'`                                                                                  | Indicates whether [Apollo Tracing](https://github.com/apollographql/apollo-tracing) should be enabled or disabled for your server (if a string is provided, accepted values are: `'enabled'`, `'disabled'`, `'http-header'`)                                                                                                 |
| `port`                   | Number or String                                                 | `4000`                                                                                           | Determines the port your server will be listening on (note that you can also specify the port by setting the `PORT` environment variable)                                                                                                                                                                                    |
| `endpoint`               | String                                                           | `'/'`                                                                                            | Defines the HTTP endpoint of your server                                                                                                                                                                                                                                                                                     |
| `subscriptions`          | Object or String or `false`                                      | `'/'`                                                                                            | Defines the subscriptions (websocket) endpoint for your server; accepts an object with [subscription server options](https://github.com/apollographql/subscriptions-transport-ws#constructoroptions-socketoptions) `path`, `keepAlive`, `onConnect` and `onDisconnect`; setting to `false` disables subscriptions completely |
| `playground`             | String or `false`                                                | `'/'`                                                                                            | Defines the endpoint where you can invoke the [Playground](https://github.com/graphcool/graphql-playground); setting to `false` disables the playground endpoint                                                                                                                                                             |
| `defaultPlaygroundQuery` | String                                                           | `undefined`                                                                                      | Defines default query displayed in Playground.                                                                                                                                                                                                                                                                               |
| `uploads`                | [UploadOptions](/src/types.ts#L39-L43) or `false` or `undefined` | `null`                                                                                           | Provides information about upload limits; the object can have any combination of the following three keys: `maxFieldSize`, `maxFileSize`, `maxFiles`; each of these have values of type Number; setting to `false` disables file uploading                                                                                   |
| `https`                  | [HttpsOptions](/src/types.ts#L62-L65) or `undefined`             | `undefined`                                                                                      | Enables HTTPS support with a key/cert                                                                                                                                                                                                                                                                                        |
| `getEndpoint`            | String or Boolean                                                | `false`                                                                                          | Adds a graphql HTTP GET endpoint to your server (defaults to `endpoint` if `true`). Used for leveraging CDN level caching.                                                                                                                                                                                                   |
| `deduplicator`           | Boolean                                                          | `true`                                                                                           | Enables [graphql-deduplicator](https://github.com/gajus/graphql-deduplicator). Once enabled sending the header `X-GraphQL-Deduplicate` will deduplicate the data.                                                                                                                                                            |
| `bodyParserOptions`      | BodyParserJSONOptions                                            | [BodyParserJSONOptions Defaults](https://github.com/expressjs/body-parser#bodyparserjsonoptions) | Allows pass through of [body-parser options](https://github.com/expressjs/body-parser#bodyparserjsonoptions)                                                                                                                                                                                                                 |

Additionally, the `options` object exposes these `apollo-server` options:

| Key               | Type                 | Note                                                                                                                                                                                                                                                                                                                                 |
| ----------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cacheControl`    | Boolean              | Enable extension that returns Cache Control data in the response                                                                                                                                                                                                                                                                     |
| `formatError`     | Number               | A function to apply to every error before sending the response to clients. Defaults to [defaultErrorFormatter](https://github.com/graphcool/graphql-yoga/blob/master/src/defaultErrorFormatter.ts). Please beware, that if you override this, `requestId` and `code` on errors won't automatically be propagated to your yoga server |
| `logFunction`     | LogFunction          | A function called for logging events such as execution times                                                                                                                                                                                                                                                                         |
| `rootValue`       | any                  | RootValue passed to GraphQL execution                                                                                                                                                                                                                                                                                                |
| `validationRules` | Array of functions   | Additional GraphQL validation rules to be applied to client-specified queries                                                                                                                                                                                                                                                        |
| `fieldResolver`   | GraphQLFieldResolver | Specify a custom default field resolver function                                                                                                                                                                                                                                                                                     |
| `formatParams`    | Function             | A function applied to each query in a batch to format parameters before execution                                                                                                                                                                                                                                                    |
| `formatResponse`  | Function             | A function applied to each response after execution                                                                                                                                                                                                                                                                                  |
| `debug`           | boolean              | Print additional debug logging if execution errors occur                                                                                                                                                                                                                                                                             |
