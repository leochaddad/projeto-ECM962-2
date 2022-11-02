import { createServer, createPubSub } from "graphql-yoga";
import { resolvers, typeDefs } from "./typeDefs";

const server = createServer({
  schema: {
    typeDefs,
    resolvers,
  },
});

server.start();
