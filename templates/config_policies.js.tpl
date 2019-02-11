/**
 * POLICIES
 */

const {
  and,
  or,
  not,
  allow,
  deny,
  rule,
  shield
} = require("graphql-yogq-waterline/lib/shield");
module.exports.policies = {
  Query: {
    hello: {
      and: ["isAuthenticated"],
      or: ["isAuthenticated"],
      not: ["isAuthenticated"]
    }
  }
};
