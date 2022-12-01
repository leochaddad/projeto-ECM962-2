import { createPubSub } from "graphql-yoga";

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
    operation: String!
    fieldName: String!
    timestamp: String!
  }

  type Query {
    chatRooms: [ChatRoom]

    users: [User]

    messages: [Message]

    roomSubscribers: RoomSubscribers

    logs: [Log]
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

// sample create Message mutation
