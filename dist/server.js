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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
const env_config_1 = require("./app/config/env.config");
const redis_config_1 = require("./app/config/redis.config");
const seedAdmin_1 = require("./app/utils/seedAdmin");
const seedSettings_1 = require("./app/utils/seedSettings");
let server;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(env_config_1.envVars.DB_URL);
        console.log("🏪 Mongoose connection success.");
        server = app_1.app.listen(env_config_1.envVars.PORT, () => {
            console.log(`🔥 Server running on port: http://localhost:${env_config_1.envVars.PORT}`);
        });
    }
    catch (error) {
        console.log(error);
    }
});
process.on("SIGTERM", () => {
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
});
process.on("uncaughtException", () => {
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
});
process.on("unhandledRejection", (error) => {
    console.log("unhandled", error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, redis_config_1.connectRedis)();
    yield startServer();
    yield (0, seedSettings_1.seedSettings)();
    yield (0, seedAdmin_1.seedAdmin)();
}))();
