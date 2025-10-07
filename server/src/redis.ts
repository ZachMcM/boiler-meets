import { createClient } from "redis";

export const redis = createClient({
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PW,
  socket: {
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!),
  },
});

redis.connect();
