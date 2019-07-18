export * from "apollo-server-errors";
import { ApolloError } from "apollo-server";

export class ServerError extends ApolloError {
  constructor(message, code, properties) {
    super(message, code, properties);
  }
}
