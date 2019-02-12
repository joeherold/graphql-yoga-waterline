/**
 * isAdmin SAMPLE FILE
 */

/**
 *
 * a policy is made with a rule function, that looks
 * like a resolver function, according to its parameters
 *
 * additionally, we have a cache parameter to be set
 *
 * "no_cache" | false - prevents rules from being cached.
 * "contextual" - use when rule only relies on ctx parameter.
 * "strict" - use when rule relies on parent or args parameter as well.
 *
 * INFO: the policy ist accessiable in the policies config by its filename
 * e.g. isAdmin.js => will be accessible as "isAdmin"
 *
 */
module.exports = {
  // the rule function
  rule: async (_, args, ctx, info) => {
    /**
     * here we do a little fake function
     */
    return false;
  },

  // the rule cache configuration
  cache: false
};
