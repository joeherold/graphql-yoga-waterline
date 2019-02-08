// entry file
import { GraphQLServer } from "graphql-yoga";

import { getDatabase } from "./util/database";
import { getSchemaFromModels } from "./util/graphql/schema-generator";
import configReader from "./util/environment/config-reader";
import path from "path";
import fs from "fs";
import OKGGraphQLScalars, {
  OKGScalarDefinitions
} from "@okgrow/graphql-scalars";
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from "graphql-iso-date";
// import datastores from "../config/datastores";
// console.log(datastores);
const rootPath = path.resolve(process.cwd()); //path.join(__dirname, "../");
import parseArgs from "./util/environment/args";
global.app = {
  port: 4000,
  endpoint: "/",
  root: rootPath,
  env: "dev"
};
parseArgs(app);

const lift = async config => {
  process.title = "GraphQL Waterline Server";
  await configReader();
  // console.log("config: ", app.config);
  // process.exit(0);
  let dbConfig = {
    defaultModelSettings: app.config.models
  };
  const db = await getDatabase(dbConfig);

  if (app.env == "dev") {
    const schema = await getSchemaFromModels(db.models);
    fs.writeFileSync(
      path.join(app.root, "api/schema.generated.graphql"),
      schema
    );
  }

  const UserModel = db.model("UserModel");
  const PetModel = db.model("PetModel");
  //   console.log(UserModel.attributes);

  const newUser = await UserModel.create({
    firstName: "Neil",
    lastName: "Armstrong",
    email: "j.pichler@webpixels.at"
  }).fetch();

  const newPet = await PetModel.create({
    breed: "beagle",
    type: "dog",
    name: "Astro",
    owner: newUser.id
  }).fetch();

  // const genTypeDefs = path.join(app.root, "api/schema.generated.graphql");
  const genTypeDefs = fs.readFileSync(
    path.join(app.root, "api/schema.generated.graphql"),
    "utf8"
  );
  const typeDefs = fs.readFileSync(
    path.join(app.root, "api/schema.graphql"),
    "utf8"
  );
  // init the application
  let resolvers = require(path.join(app.root, "api/resolvers"));
  const server = new GraphQLServer({
    typeDefs: [
      ...OKGScalarDefinitions,
      // "scalar Date\nscalar Time\n",
      // "scalar GraphQLDate\nscalar GraphQLDateTime scalar GraphQLTime\n",
      genTypeDefs + "\n" + typeDefs
    ],
    resolvers: {
      ...OKGGraphQLScalars,
      // Date: GraphQLDate,
      // DateTime: GraphQLDateTime,
      // Time: GraphQLTime,
      ...resolvers
    },
    context: request => {
      return {
        ...request,
        db: db
      };
    }
  });
  server.start(
    {
      port: app.port
    },
    () => console.log(`Server is running on localhost:${app.port}`)
  );
  return {
    server,
    db,
    express: server.express
  };
};

export default {
  boot: opts => lift(opts),
  lift: opts => lift(opts)
};
