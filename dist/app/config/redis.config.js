"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const env_config_1 = require("./env.config");
exports.redisClient = (0, redis_1.createClient)({
    username: "default",
    password: env_config_1.envVars.REDIS.REDIS_PASSWORD,
    socket: {
        host: env_config_1.envVars.REDIS.REDIS_HOST,
        port: env_config_1.envVars.REDIS.REDIS_PORT,
    },
});
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    exports.redisClient.on("error", (err) => console.log("Redis Client Error", err));
    yield exports.redisClient.connect();
    console.log("connected redis...");
});
exports.connectRedis = connectRedis;
// await client.set("foo", "bar");
// const result = await client.get("foo");
// console.log(result); // >>> bar
