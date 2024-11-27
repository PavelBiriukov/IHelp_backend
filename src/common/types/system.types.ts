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
  _id: string;
  id?: string;
  createdAt: string;
  updatedAt: string;
}
