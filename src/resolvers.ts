import { createPubSub } from "graphql-yoga";
import { db } from "./db";

const pubsub = createPubSub();

export const resolvers = {
  Query: {
    chatRooms: () => db.chatRooms,
    users: () => db.users,
    messages: () => db.chatRooms.flatMap((room) => room.messages),
    roomSubscribers: () => ({
      cinema: db.users.filter((user) => user.subscribedTo.includes("CINEMA"))
        .length,
      general: db.users.filter((user) => user.subscribedTo.includes("GENERAL"))
        .length,
      sports: db.users.filter((user) => user.subscribedTo.includes("SPORTS"))
        .length,
    }),
    logs: () => db.logs,
  },
  Mutation: {
    createUser: (parent: any, args: any, context: any, info: any) => {
      const user = {
        username: args.username,
        password: args.password,
        subscribedTo: [],
      };

      if (db.users.find((user: any) => user.username === args.username)) {
        return new Error("User already exists");
      } else {
        db.users.push(user);
        return user;
      }
    },

    createMessage: (parent: any, args: any, context: any, info: any) => {
      if (!db.users.find((user: any) => user.username === args.username)) {
        return new Error("User does not exist");
      }
      if (!db.chatRooms.find((room: any) => room.category === args.category)) {
        return new Error("Chat room does not exist");
      }
      if (args.message.length > 500) {
        return new Error("Message is too long");
      }

      const message = {
        message: args.message,
        timestamp: new Date().toISOString(),
        user: db.users.find((user: any) => user.username === args.username),
      };

      db.chatRooms
        .find((chatRoom: any) => chatRoom.category === args.category)
        .messages.push(message);
      pubsub.publish(args.category, message);
      return message;
    },
  },
  Subscription: {
    subscribeToChatRoom: {
      subscribe: (parent: any, args: any, context: any, info: any) => {
        db.users.find(
          (user: any) => user.username === args.username
        ).subscribedTo = [
          ...new Set([
            ...db.users.find((user: any) => user.username === args.username)
              .subscribedTo,
            args.category,
          ]),
        ];
        return pubsub.subscribe(args.category);
      },
      resolve: (payload: any) => {
        return payload;
      },
    },
  },
};
