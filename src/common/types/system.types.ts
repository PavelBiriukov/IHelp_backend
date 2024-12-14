import { ObjectId } from 'mongoose';

export type ServerConfiguration = {
  port: number;
  ws_port: number;
  cors_origins?: string;
  http_address?: string;
};

export type DatabaseConfiguration = {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
};

export type VKConfiguration = {
  appId: number;
  appSecret: string;
};
export type JWTConfiguration = {
  key: string;
  ttl: string;
};

export type CryptoConfiguration = {
  saltRounds: number;
};

export type AppConfiguration = {
  server: ServerConfiguration;
  database: DatabaseConfiguration;
  vk: VKConfiguration;
  jwt: JWTConfiguration;
  password: CryptoConfiguration;
};

export interface MongooseIdAndTimestampsInterface {
  _id: string | ObjectId;
  id?: string | ObjectId;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export const ChatType = {
  TASK_CHAT: 'TASK_CHAT',
  SYSTEM_CHAT: 'SYSTEM_CHAT',
  CONFLICT_CHAT_WITH_VOLUNTEER: 'CONFLICT_CHAT_WITH_VOLUNTEER',
  CONFLICT_CHAT_WITH_RECIPIENT: 'CONFLICT_CHAT_WITH_RECIPIENT',
} as const;
export const ChatTypes = ChatType;
export type ChatType = keyof typeof ChatType;
