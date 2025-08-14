import dotenv from "dotenv";
dotenv.config();

interface IRequiredVars {
  PORT: string;
  NODE_ENV: "development" | "production";
  DB_URL: string;
}

const loadEnvVariables = (): IRequiredVars => {
  const envVariables = ["PORT", "NODE_ENV", "DB_URL"];
  envVariables.forEach((variable) => {
    if (!process.env[variable])
      throw new Error(`Missing env variable: ${variable}`);
  });

  return {
    PORT: process.env.PORT as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    DB_URL: process.env.DB_URL as string,
  };
};

export const envVars = loadEnvVariables();
