import { ensureFilestructure as efs } from "../util/hooks/files/filestructure";
import { getSchemaFromModels } from "../util/hooks/graphql/schema-generator";
import { getDatabase } from "../util/hooks/database";
import fs from "fs";
import path from "path";

export const buildModelSchemasOnly = async () => {
  // console.log(dawnship);
  let dbConfig = {
    adapters: dawnship.config.adapters,
    datastores: dawnship.config.datastores,
    defaultModelSettings: dawnship.config.models
  };

  const db = await getDatabase(dbConfig);
  // console.log(dbConfig);

  const schema = await getSchemaFromModels(db.models);

  fs.writeFileSync(
    path.join(dawnship.root, "api/schema/models.graphql"),
    schema
  );
};

export const ensureFilestructure = async () => {
  await efs(dawnship);
};
