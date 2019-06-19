export const toJsonMiddleware = async (resolve, root, args, context, info) => {
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
