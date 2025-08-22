import { createClient } from "redis";
import { envVars } from "./env.config";

export const redisClient = createClient({
  username: "default",
  password: envVars.REDIS.REDIS_PASSWORD,
  socket: {
    host: envVars.REDIS.REDIS_HOST,
    port: envVars.REDIS.REDIS_PORT,
  },
});
export const connectRedis = async () => {
  redisClient.on("error", (err) => console.log("Redis Client Error", err));
  await redisClient.connect();
  console.log("connected redis...");
};
// await client.set("foo", "bar");
// const result = await client.get("foo");
// console.log(result); // >>> bar
