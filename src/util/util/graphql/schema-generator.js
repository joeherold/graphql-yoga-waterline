const defaultTypes = ["Int", "String", "Boolean", "ID"];
import _ from "lodash";
export const getSchemaFromModels = async models => {
  let schema =
    "###############################\n## Schema of the defined Models\n###############################\n";
  let additionalScalar = [];
  let scalars =
    "####################################################\n## Scalars of types, not in Int, String, Boolean, ID\n####################################################\n";
  //   console.log(models);
  for (let model in models) {
    // console.log(model);
    let fields = "";
    for (let field in models[model].attributes) {
      //   console.log(field);
      let type = "";
      let mandatory = models[model].attributes[field]["required"] === true;
      if (field == models[model]["primaryKey"]) {
        mandatory = true;
      }
      if (["createdAt", "updatedAt"].indexOf(field) > -1) {
        type = "DateTime";
        // additionalScalar.push("DateTime");
      } else if (models[model].attributes[field].hasOwnProperty("type")) {
        type = models[model].attributes[field]["type"];

        if (type == "number") {
          type = "Int";
        }
        if (models[model].attributes[field]["columnType"]) {
          type = models[model].attributes[field]["columnType"];
        }
        type = type.charAt(0).toUpperCase() + type.slice(1);
        if (defaultTypes.indexOf(type) >= 0) {
        } else {
          additionalScalar.push(type);
        }
      } else if (models[model].attributes[field].hasOwnProperty("model")) {
        type = models[model].attributes[field]["model"];
        type = type.charAt(0).toUpperCase() + type.slice(1);
      } else if (models[model].attributes[field].hasOwnProperty("collection")) {
        type = models[model].attributes[field]["collection"];
        type = type.charAt(0).toUpperCase() + type.slice(1);
        mandatory = false;
        type = "[" + type + "!]!";
      }
      fields += `\n  ${field}: ${type}${mandatory ? "!" : ""}`;
    }
    const tpl = `\n# api/models/${model.charAt(0).toUpperCase() +
      model.slice(1)}Model.js\ntype ${model.charAt(0).toUpperCase() +
      model.slice(1)} {${fields}
}
    `;
    schema += "" + tpl;
  }
  additionalScalar = _.uniq(additionalScalar);
  for (let scalar of additionalScalar) {
    scalars += `scalar ${scalar}\n`;
  }
  const fullSchema = `
${scalars}
${schema}
`;
  //   console.log(fullSchema);
  return fullSchema;
};
