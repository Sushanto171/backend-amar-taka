/* eslint-disable no-console */
import { Server } from "http";
import mongoose from "mongoose";
import { app } from "./app";
import { envVars } from "./app/config/env.config";
import { connectRedis } from "./app/config/redis.config";
import { seedAdmin } from "./app/utils/seedAdmin";
import { seedSettings } from "./app/utils/seedSettings";
let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);
    console.log("🏪 Mongoose connection success.");
    server = app.listen(envVars.PORT, () => {
      console.log(
        `🔥 Server running on port: http://localhost:${envVars.PORT}`
      );
    });
  } catch (error) {
    console.log(error);
  }
};

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

process.on("unhandledRejection", () => {
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});

(async () => {
  await connectRedis();
  await startServer();
  await seedSettings();
  await seedAdmin();
})();
