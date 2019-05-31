import _ from "lodash";

/**
 * normalize model attributes fields
 * @param {*} model
 */
export const normalizeModelDefs = inModel => {
  /**
   * VALIDATE IDENTITY
   */

  const model = { ...inModel };
  var PROPS_TO_AUTOMIGRATE = ["autoIncrement", "unique", "columnType"];
  var VALIDATIONS = require("waterline/accessible/allowed-validations");
  //   var DEPRECATED_VALIDATIONS = require("../constants/deprecated-validations.list");
  //   var UNSUPPORTED_VALIDATIONS = require("../constants/invalid-validations.list");
  let _attributes = model.attributes;

  for (let field in _attributes) {
    let _field = _attributes[field];

    // Move certain attribute properties into `autoMigrations`.  These are not valid top-level
    // properties as far as waterline-schema is concerned.
    // Every attribute needs an `autoMigrations` dictionary
    _field.autoMigrations = _field.autoMigrations || {};

    for (let property of PROPS_TO_AUTOMIGRATE) {
      if (!_.isUndefined(_field[property])) {
        _field.autoMigrations[property] = _field[property];

        delete _field[property];
      }

      // Set the `unique` autoMigration property to `true` if it's the primary key,
      // otherwise default it to `false` if it's not already configured.
      _field.autoMigrations.unique =
        _field.autoMigrations.unique || model.primaryKey == field || false;

      // Set the `autoIncrement` autoMigration property to `false` if it's not already configured.
      _field.autoMigrations.autoIncrement =
        _field.autoMigrations.autoIncrement || false;

      // Set the `columnType` autoMigration property for non-associations.  `columnType` for
      // singular ("model") associations will be set later, in a call to `normalizeColumnTypes`.
      // This lets `waterline-schema` further validate the models (e.g. verifying that associations
      // are valid) before we continue.

      if (_field.type) {
        _field.autoMigrations.columnType =
          _field.autoMigrations.columnType ||
          (function setColumnType() {
            // Primary keys get a special '_stringkey' or '_numberkey' column type.
            if (model.primaryKey === field) {
              return "_" + _field.type.toLowerCase() + "key";
            }
            // Timestamps get a special '_stringtimestamp' or '_numbertimestamp' column type.
            if (_attributes.autoUpdatedAt || _attributes.autoCreatedAt) {
              return "_" + _field.type.toLowerCase() + "timestamp";
            }
            // Otherwise just use the lower-cased type, prefixed with an underscore.
            return "_" + _field.type.toLowerCase();
          })();
      }
    }
    // console.log("_attributes: ", _attributes);

    // Move certain attribute properties into `validations`.
    // These are not valid top-level
    // properties as far as waterline-schema is concerned.
    _field.validations = _field.validations || {};

    for (let validationKey in VALIDATIONS) {
      if (!_.isUndefined(_field[validationKey])) {
        _field.validations[validationKey] = _field[validationKey];
        delete _field[validationKey];
      }
    }
  }

  return { ...model };
};

export default normalizeModelDefs;
