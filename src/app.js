const gqlYogaWaterlineServer = require("./index");

// use async / await for more easy reading
(async () => {
  // config für gql
  const gqlServer = {};

  // config für server
  const bootOptions = {
    endpoint: "/"
  };
  const server = await gqlYogaWaterlineServer(gqlServer);

  const express = server.express;
  express.use("/myEndpoint", (req, res) => {
    res.send("OK");
  });

  const result = await server.boot(bootOptions);
  console.log(`Server is running on port: ${result.port}`);
})();
