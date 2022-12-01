import { createServer, createPubSub } from "graphql-yoga";
import { typeDefs } from "./typeDefs";
import { resolvers } from "./resolvers";

import { applyMiddleware } from "graphql-middleware";
import { logsMiddleware } from "./middleware/logs";
import { makeExecutableSchema } from "@graphql-tools/schema";

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const server = createServer({
  schema: applyMiddleware(schema, logsMiddleware),
});

server.start();
