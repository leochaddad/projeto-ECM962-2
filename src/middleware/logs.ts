// middleware for logging requests gql

import { db } from "../db";

export const logsMiddleware = async (
  resolve: any,
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  const result = await resolve(parent, args, context, info);

  const log = {
    operation: info.operation.operation,
    fieldName: info.fieldName,
    timestamp: new Date().toISOString(),
  };
  db.logs.push(log);
  return result;
};
