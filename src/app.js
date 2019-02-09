/**
 * app.js
 *
 * Use `app.js` to run your app.
 * To start the server, run: `npx babel-node app.js`.
 *
 * The same command-line arguments and env vars are supported, e.g.:
 * `NODE_ENV=prod PORT=80 npm start`
 */
import { inspect } from "util";
import server from "./lib/server";
const options = {
  endpoint: "/"
};

const server = server();
server.start();
server
  .lift(options)
  .then(({ server, db, express }) => {
    // console.log(inspect(db.models.pet.schema, true, 1));
  })
  .catch(err => {
    console.error(err);
  });
