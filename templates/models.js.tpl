/**
 *
 */
module.exports.models = {
  /**
   * Default attributes to implicitly include in all of your app's model definitions.
   * (Can be overridden on an attribute-by-attribute basis.)
   * @url https://sailsjs.com/documentation/concepts/models-and-orm/attributes
   * */
  attributes: {
    id: {
      type: "number",
      required: true,
      autoIncrement: true
    },
    createdAt: { type: "number", autoCreatedAt: true },
    updatedAt: { type: "number", autoUpdatedAt: true }
  },

  /**
   * The auto-migration strategy for your GraphQL app. How & whether GraphQL App will
   * attempt to automatically rebuild the tables/collections/etc. in your schema every
   * time it lifts.
   * */
  migrate: "alter",

  /**
   * Only relevant for models hooked up to a schemaless database like MongoDB.
   * If set to true, then the ORM will switch into "schemaful" mode. For example,
   * if properties passed in to .create(), .createEach(), or .update() do not correspond
   * with recognized attributes, then they will be stripped out before saving.
   */
  schema: false,

  /**
   * The default datastore configuration any given model will use without a
   * configured override. Avoid changing this.
   */
  datastore: "default",

  /**
   * The name of the attribute that every model in your app should use as its primary
   * key by default. Can be overridden here, or on a per-model basis-- but there's
   * usually a better way.
   */
  primaryKey: "id",

  /**
   * The identity of the model to use when calling .archive(). By default, this is
   * the Archive model, an implicit model automatically defined by Waterline ORM.
   * Set to false to disable built-in support for soft-deletes.
   */
  archiveModelIdentity: "archive" // String or Boolean
};
