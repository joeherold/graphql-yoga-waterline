/**
 * settings for the graphql-yoga server, how to boot up
 * full documentation: https://www.npmjs.com/package/graphql-yoga-waterline#bootopts
 */
module.exports.settings = {
  /* #####################################################################
       Contains configuration options for cors
     ##################################################################### */
  cors: undefined,

  /* #####################################################################
      Indicates whether Apollo Tracing should be enabled or disabled for
      your server (if a string is provided, accepted values are:
      'enabled', 'disabled', 'http-header') 
    ##################################################################### */
  tracing: "http-header",

  /* #####################################################################
      Determines the port your server will be listening on (note that
      you can also specify the port by setting the PORT environment variable)
     ##################################################################### */
  port: 4000,

  /* #####################################################################
      Defines the HTTP endpoint of your server
     ##################################################################### */
  endpoint: "/",

  /* #####################################################################
      Defines the subscriptions (websocket) endpoint for your server;
      accepts an object with subscription server options path, keepAlive,
      onConnect and onDisconnect; setting to false disables
      subscriptions completely
    ##################################################################### */
  subscriptions: false,

  /* #####################################################################
      Defines the endpoint where you can invoke the Playground;
      setting to false disables the playground endpoint
     ##################################################################### */
  playground: "/",

  /* ##################################################################### 
      Defines default query displayed in Playground.
     ##################################################################### */
  defaultPlaygroundQuery: undefined,

  /* #####################################################################
      Provides information about upload limits; the object can have any
      combination of the following three keys: maxFieldSize, maxFileSize,
      maxFiles; each of these have values of type Number; setting to
      false disables file uploading
     ##################################################################### */

  uploads: undefined,

  /* #####################################################################
      Enables HTTPS support with a key/cert
     ##################################################################### */

  https: undefined,

  /* #####################################################################
      Adds a graphql HTTP GET endpoint to your server (defaults to
      endpoint if true). Used for leveraging CDN level caching.
    ##################################################################### */
  getEndpoint: false,

  /* #####################################################################
      Enables graphql-deduplicator. Once enabled sending the header
      X-GraphQL-Deduplicate will deduplicate the data.
     ##################################################################### */
  deduplicator: true,

  /* #####################################################################
      Allows pass through of body-parser options
     ##################################################################### */
  bodyParserOptions: undefined

  /**
   * #####################################################################
   * #####################################################################
   * Additionally, the options object exposes these apollo-server options:
   * #####################################################################
   * #####################################################################
   */

  /* ##################################################################### 
      Enable extension that returns Cache Control data in the response 
     ##################################################################### */
  // cacheControl: false,

  /* ##################################################################### 
      A function to apply to every error before sending the response to clients.
      Defaults to defaultErrorFormatter. Please beware, that if you override this,
      requestId and code on errors won't automatically be propagated to your yoga serve
     ##################################################################### */

  // formatError: fn

  /*  
  example: 
      formatError: error => {
          console.log(error);
          return new Error("Internal server error");
          // Or, you can delete the exception information
          // delete error.extensions.exception;
        // return error;
      }
  */

  /* #####################################################################   
      RootValue passed to GraphQL execution 
     ##################################################################### */
  // rootValue: any

  /* #####################################################################   
      Additional GraphQL validation rules to be applied to client-specified queries
     ##################################################################### */
  // validationRules: [fn, fn, fn, ...]

  /* #####################################################################   
      Specify a custom default field resolver functioni
     ##################################################################### */
  // fieldResolver: GraphQLFieldResolver

  /* #####################################################################   
      A function applied to each query in a batch to format parameters before execution
     ##################################################################### */
  // formatParams: fn

  /* #####################################################################   
      A function applied to each response after execution
     ##################################################################### */
  // formatResponse: fn

  /* #####################################################################   
      Print additional debug logging if execution errors occur
     ##################################################################### */
  // debug: true|false
};
