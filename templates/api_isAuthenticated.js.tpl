const {
  and,
  or,
  not,
  allow,
  deny,
  rule,
  shield
} = require("graphql-yogq-waterline/lib/shield");

module.exports = async (_, args, ctx, info) => {
  // fake unauthenticated
  return false;
};
