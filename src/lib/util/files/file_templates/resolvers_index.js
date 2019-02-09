const resolvers = {
  Query: {
    // user: async (_, args, ctx) => {
    //   const UserModel = ctx.db.model("User");
    //   const arrUsers = await UserModel.find();

    //   return arrUsers;
    // },
    hello: (_, { name }) => `Hello ${name || "World"}`
  }
};
module.exports = resolvers;
