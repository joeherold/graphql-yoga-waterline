import _ from "lodash";

/**
 * normalize model attributes fields
 * @param {*} model
 */
export const normalizeModelDefs = model => {
  var PROPS_TO_AUTOMIGRATE = ["autoIncrement", "unique", "columnType"];
  var VALIDATIONS = require("waterline/accessible/allowed-validations");
  //   var DEPRECATED_VALIDATIONS = require("../constants/deprecated-validations.list");
  //   var UNSUPPORTED_VALIDATIONS = require("../constants/invalid-validations.list");
  let _attributes = model.attributes;

  for (let field in _attributes) {
    // Move certain attribute properties into `autoMigrations`.  These are not valid top-level
    // properties as far as waterline-schema is concerned.
    // Every attribute needs an `autoMigrations` dictionary
    _attributes[field].autoMigrations = _attributes[field].autoMigrations || {};
    for (let property of PROPS_TO_AUTOMIGRATE) {
      if (!_.isUndefined(_attributes[field][property])) {
        _attributes[field].autoMigrations[property] =
          _attributes[field][property];
        delete _attributes[field][property];
      }
    }

    // Move certain attribute properties into `validartions`.  These are not valid top-level
    // properties as far as waterline-schema is concerned.
    _attributes[field].validations = _attributes[field].validations || {};

    for (let validationKey in VALIDATIONS) {
      if (!_.isUndefined(_attributes[field][validationKey])) {
        _attributes[field].validations[validationKey] =
          _attributes[field][validationKey];
        delete _attributes[field][validationKey];
      }
    }
    // console.log(model);
  }

  return model;
};
