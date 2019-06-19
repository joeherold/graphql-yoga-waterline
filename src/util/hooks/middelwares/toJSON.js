export const toJsonMiddleware = async (resolve, root, args, context, info) => {
  if (process.env.NODE_ENV !== "production") {
    console.log("toJSON Middleware...");
  }
  const result = await resolve(root, args, context, info);
  if (
    result &&
    result.hasOwnProperty("toJSON") &&
    typeof result.toJSON == "function"
  ) {
    return result.toJSON();
  }
  return result;
};
