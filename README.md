# graphql-yoga-waterline

an easy implementation of the graphql-yoga server, but with Waterline ORM implemented, for easy Setup of DB or FileStore driven APIs

## Usage

```js
var aContextServiceProvoder = requrie("my-service-provider");

const yogaServer = require("graphql-yoga-waterline");

// for furthor information see: https://github.com/prisma/graphql-yoga#graphqlserver

let cgraphQlServerConfig = {
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

let bootOptions = {
  endpoint: "/"
};

yogaServer
  .boot(cgraphQlServerConfig, bootOptions)
  .then(({ server, db, express }) => {
    // console.log(inspect(db.models.pet.schema, true, 1));
  })
  .catch(err => {
    console.error(err);
  });
```

(\*) Notice that the req argument is an object of the shape { request, response, connection } which either carries a request: Request property (when it's a Query/Mutation resolver), response: Response property (when it's a Query/Mutation resolver), or a connection: SubscriptionOptions property (when it's a Subscription resolver). [Request](http://expressjs.com/en/api.html#req) is imported from Express.js. [Response](http://expressjs.com/en/api.html#res) is imported from Express.js aswell. SubscriptionOptions is from the [graphql-subscriptions](https://github.com/apollographql/graphql-subscriptions) package. SubscriptionOptions are getting the connectionParams automatically injected under SubscriptionOptions.context.[CONNECTION_PARAMETER_NAME]

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
