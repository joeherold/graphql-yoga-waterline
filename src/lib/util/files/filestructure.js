import mkdirp from "mkdirp";
import fs from "fs";
import path from "path";

const generateFolderAtPath = async absPath => {
  return new Promise(resolve => {
    mkdirp(absPath, async (err, sucess) => {
      if (err) {
        // throw new Error(err);
      }
      const gitKeepMessage = `###########################
### auto generated file ###\n###########################
# This file was created, because the folder did not exist.
# To ensure, the folder persits in your SVN, this .gitkeep file is created
`;
      await generateFileAtPathWithContent(
        path.join(absPath, "/.gitkeep"),
        gitKeepMessage
      );
      resolve(true);
    });
  });
};

const generateFileAtPathWithContent = async (absPathToFile, content) => {
  return new Promise(resolve => {
    fs.writeFile(absPathToFile, content, { flag: "wx" }, (err, success) => {
      if (err) {
        // throw new Error(err);
      }
      resolve(true);
    });
  });
};

const readFileAtPath = async absPathToFile => {
  return new Promise(resolve => {
    fs.readFile(absPathToFile, "utf8", (err, data) => {
      resolve(data);
    });
  });
};

export default async rootPath => {
  await generateFolderAtPath(path.join(rootPath, "/api/models"));
  await generateFolderAtPath(path.join(rootPath, "/api/schema"));
  await generateFolderAtPath(path.join(rootPath, "/api/policies"));

  await generateFolderAtPath(path.join(rootPath, "/api/resolvers"));

  const resolversData = await readFileAtPath(
    path.join(__dirname, "file_templates/resolvers_index.js")
  );
  await generateFileAtPathWithContent(
    path.join(rootPath, "/api/resolvers/index.js"),
    resolversData
  );

  await generateFolderAtPath(path.join(rootPath, "/config"));

  const schemaPath = path.join(rootPath, "api/schema/schema.graphql");
  if (!fs.existsSync(schemaPath)) {
    fs.writeFileSync(
      schemaPath,
      `################################\n## AUTO GENERATED SCHEMA FILE ##\n################################\ntype Query {\n  hello: String!\n}`,
      { flag: "wx" }
    );
  }

  const modelSchemaPath = path.join(rootPath, "api/schema/models.graphql");
  if (!fs.existsSync(modelSchemaPath)) {
    fs.writeFileSync(
      modelSchemaPath,
      `################################\n## AUTO GENERATED SCHEMA FILE ##\n################################\n`,
      { flag: "wx" }
    );
  }

  //generate config files...
  const adapterData = await readFileAtPath(
    path.join(__dirname, "file_templates/adapters.js")
  );
  await generateFileAtPathWithContent(
    path.join(rootPath, "/config/adapters.js"),
    adapterData
  );

  //generate config files...

  const bootstrapData = await readFileAtPath(
    path.join(__dirname, "file_templates/bootstrap.js")
  );
  await generateFileAtPathWithContent(
    path.join(rootPath, "/config/bootstrap.js"),
    bootstrapData
  );
  //generate config files...

  const datastoreData = await readFileAtPath(
    path.join(__dirname, "file_templates/datastores.js")
  );
  await generateFileAtPathWithContent(
    path.join(rootPath, "/config/datastores.js"),
    datastoreData
  );

  const modelsData = await readFileAtPath(
    path.join(__dirname, "file_templates/models.js")
  );
  await generateFileAtPathWithContent(
    path.join(rootPath, "/config/models.js"),
    modelsData
  );
};
