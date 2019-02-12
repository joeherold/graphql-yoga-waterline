import * as gShield from "graphql-shield";
import { getNamedType } from "graphql";
import _ from "lodash";

const mapStringToFunctions = (args, fnType) => {
  const policies = app.hooks.policies;
  // console.log("policies: \n", policies);

  if (!_.isObject(policies)) {
    return fnType.apply(null, []);
  }

  let newArgs = [];
  if (args && args.length > 0) {
    for (let argument of args) {
      // console.log("argument: ", argument);
      // console.log(policies[argument]);
      if (typeof argument === "string" && policies[argument]) {
        newArgs.push(policies[argument]);
      }
    }
  }
  // console.log("newArgs");
  // process.exit(1);
  return fnType.apply(null, newArgs);
};

export const and = (...args) => mapStringToFunctions(args, gShield.and);
export const or = (...args) => mapStringToFunctions(args, gShield.or);
export const not = (...args) => mapStringToFunctions(args, gShield.not);
export const allow = gShield.allow;
export const deny = gShield.deny;
export const rule = (...args) => gShield.rule.apply(null, args);
export const shield = (...args) => gShield.shield.apply(null, args);
export const gqlShield = {
  and: (...args) => mapStringToFunctions(args, gShield.and),
  or: (...args) => mapStringToFunctions(args, gShield.or),
  not: (...args) => mapStringToFunctions(args, gShield.not),
  allow: gShield.allow,
  deny: gShield.deny,
  rule: (...args) => gShield.rule.apply(null, args),
  shield: (...args) => gShield.shield.apply(null, args)
};

export default gqlShield;
