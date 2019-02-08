# graphql-yoga-waterline

an easy implementation of the graphql-yoga server, but with Waterline ORM implemented, for easy Setup of DB or FileStore driven APIs

## usage

```js
const yogaServer = require("graphql-yoga-waterline");

const options = {
  endpoint: "/"
};

yogaServer
  .boot(options)
  .then(({ server, db, express }) => {
    // console.log(inspect(db.models.pet.schema, true, 1));
  })
  .catch(err => {
    console.error(err);
  });
```
