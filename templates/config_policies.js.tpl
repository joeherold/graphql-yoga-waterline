/**
 * POLICIES
 */

const {
  and,
  or,
  not,
  allow,
  deny
} = require("graphql-yoga-waterline/lib/util/shield");

module.exports.policies = {
  rules: {
    // Set rules for Query types
    Query: {
      hello: and("isAuthenticated", "isAdmin")
    }
  },

  // https://github.com/maticzav/graphql-shield#options

  // Toggle catching internal errors.
  allowExternalErrors: false,

  // Toggle debug mode.
  debug: false,

  // The default rule for every "rule-undefined" field.
  fallbackRule: deny,

  // Error Permission system fallbacks to.
  fallbackError: new Error("This is my custom error Message")
};
