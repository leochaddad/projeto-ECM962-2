// Chat application
// Users can join a chat room from one of these categories: cinema, general and sports
// Users can send messages to the chat room, max 500 characters. Messages are timestamped
// If the message has more than 500 characters, the message is rejected

import { createPubSub } from "graphql-yoga";

// Users can subscribe to one or more chat rooms and receive messages from that room in real time

// A query can be made to see how many users are subscribed to each chat room eg: { cinema: 10, general: 5, sports: 2 }

// All actions are logged to the database (Query, Mutation, Subscription)

const pubsub = createPubSub();

export const typeDefs = /* GraphQL */ `
  enum Category {
    CINEMA
    GENERAL
    SPORTS
  }

  type User {
    username: String!
    password: String
    subscribedTo: [String]
  }

  type Message {
    message: String!
    timestamp: String!
    user: User!
  }

  type ChatRoom {
    # category is enum value
    category: Category!
    messages: [Message]
  }

  type RoomSubscribers {
    cinema: Int!
    general: Int!
    sports: Int!
  }

  type Log {
    action: String!
    timestamp: String!
  }

  type Query {
    # return all chat rooms
    chatRooms: [ChatRoom]
    # return all users
    users: [User]
    # return all messages
    messages: [Message]
    # return user count subscribed to each chat room
    roomSubscribers: RoomSubscribers
  }

  type Mutation {
    # create a new user
    createUser(username: String!, password: String!): User
    # create a new message
    createMessage(
      message: String!
      username: String!
      category: Category!
    ): Message
    # subscribe a user to a chat room
    subscribeUserToChatRoom(username: String!, category: Category!): User
  }

  type Subscription {
    # subscribe to a chat room
    subscribeToChatRoom(category: Category!): Message
  }
`;

const db = {
  users: [],
  chatRooms: [
    {
      category: "CINEMA",
      messages: [],
    },
    {
      category: "GENERAL",
      messages: [],
    },
    {
      category: "SPORTS",
      messages: [],
    },
  ],
  messages: [],
};

export const resolvers = {
  Query: {
    chatRooms: () => db.chatRooms,
    users: () => db.users,
    messages: () => db.messages,
    roomSubscribers: () => ({
      cinema: db.users.filter((user) => user.subscribedTo.includes("CINEMA"))
        .length,
      general: db.users.filter((user) => user.subscribedTo.includes("GENERAL"))
        .length,
      sports: db.users.filter((user) => user.subscribedTo.includes("SPORTS"))
        .length,
    }),
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
      const message = {
        message: args.message,
        timestamp: new Date().toISOString(),
        user: db.users.find((user: any) => user.username === args.username),
      };

      if (message.message.length > 500) {
        return new Error("Message is too long");
      } else {
        db.messages.push(message);
        db.chatRooms
          .find((chatRoom: any) => chatRoom.category === args.category)
          .messages.push(message);
        pubsub.publish(args.category, message);
        return message;
      }
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
