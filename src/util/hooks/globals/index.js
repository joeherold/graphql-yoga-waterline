export const createGlobals = (rootPath, processTitle) => {
  global.dawnship = {
    debug: false,
    root: rootPath,
    processTitle: processTitle || "GraphQL Waterline Server",
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

  /**
   * backwards compatibility
   */
  global.app = global.dawnship;

  /**
   * return global object
   */
  return global.dawnship;
};

export default createGlobals;
