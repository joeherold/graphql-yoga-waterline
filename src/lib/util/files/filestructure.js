import fs from "fs";
import path from "path";

import {
  renderTemplateFile,
  generateFolderAtPath,
  generateFileAtPathWithContent,
  readFileAtPath
} from "./helpers";

export default async rootPath => {
  await generateFolderAtPath(path.join(rootPath, "/api"));
  await generateFolderAtPath(path.join(rootPath, "/api/models"));
  await generateFolderAtPath(path.join(rootPath, "/api/schema"));
  await generateFolderAtPath(path.join(rootPath, "/api/policies"));
  await generateFolderAtPath(path.join(rootPath, "/api/resolvers"));
  await generateFolderAtPath(path.join(rootPath, "/config"));

  const configFilesToCreate = [
    {
      fileName: "adapters.js",
      template: "adapters.js.tpl"
    },
    {
      fileName: "bootstrap.js",
      template: "bootstrap.js.tpl"
    },
    {
      fileName: "datastores.js",
      template: "datastores.js.tpl"
    },
    {
      fileName: "models.js",
      template: "models.js.tpl"
    },
    {
      fileName: "settings.js",
      template: "settings.js.tpl"
    }
  ];

  for (let item of configFilesToCreate) {
    const data = await readFileAtPath(
      path.join(__dirname, "../../../templates/", item.template)
    );
    const result = await generateFileAtPathWithContent(
      path.join(rootPath, "/config/", item.fileName),
      data
    );
  }

  // generate an initial resolver "api/resolvers/index.js"
  const resolversData = await renderTemplateFile(
    path.join(__dirname, "../../../templates/resolvers_index.js.tpl")
  );
  await generateFileAtPathWithContent(
    path.join(rootPath, "/api/resolvers/index.js"),
    resolversData
  );

  /**
   * Generate a default api/schema/schema.graphql
   */
  const schemaPath = path.join(rootPath, "api/schema/schema.graphql");
  if (!fs.existsSync(schemaPath)) {
    fs.writeFileSync(
      schemaPath,
      `################################\n## AUTO GENERATED SCHEMA FILE ##\n################################\ntype Query {\n  hello: String!\n}`,
      { flag: "wx" }
    );
  }

  /**
   * Generate a default api/schema/models.graphql
   */
  const modelSchemaPath = path.join(rootPath, "api/schema/models.graphql");
  if (!fs.existsSync(modelSchemaPath)) {
    fs.writeFileSync(
      modelSchemaPath,
      `################################\n## AUTO GENERATED SCHEMA FILE ##\n################################\n`,
      { flag: "wx" }
    );
  }
};