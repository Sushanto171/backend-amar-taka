import dotenv from "dotenv";
dotenv.config();

interface IRequiredVars {
  PORT: string;
  NODE_ENV: "development" | "production";
  DB_URL: string;
  BCRYPT_SALT_ROUND: string;

  ADMIN: {
    ADMIN_PHONE: string;
    ADMIN_PASSWORD: string;
    ADMIN_EMAIL: string;
    ADMIN_NAME: string;
    ADMIN_INITIAL_SYSTEM_FUND: number;
  };

  USER: {
    USER_WELCOME_BONUS: number;
    USER_DAILY_CASHOUT_LIMIT: number;
    USER_MONTHLY_CASHOUT_LIMIT: number;
  };

  AGENT: {
    AGENT_INITIAL_BALANCE: number;
    AGENT_DAILY_CASHOUT_LIMIT: number;
    AGENT_MONTHLY_CASHOUT_LIMIT: number;
  };
  JWT: {
    JWT_ACCESS_SECRET: string;
    JWT_ACCESS_EXPIRATION: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRATION: string;
  };
}

const requiredVars = [
  "PORT",
  "NODE_ENV",
  "DB_URL",
  "BCRYPT_SALT_ROUND",
  "ADMIN_PHONE",
  "ADMIN_PASSWORD",
  "ADMIN_NAME",
  "ADMIN_INITIAL_SYSTEM_FUND",
  "USER_WELCOME_BONUS",
  "USER_DAILY_CASHOUT_LIMIT",
  "USER_MONTHLY_CASHOUT_LIMIT",
  "AGENT_INITIAL_BALANCE",
  "AGENT_DAILY_CASHOUT_LIMIT",
  "AGENT_MONTHLY_CASHOUT_LIMIT",
  "JWT_ACCESS_SECRET",
  "JWT_ACCESS_EXPIRATION",
  "JWT_REFRESH_SECRET",
  "JWT_REFRESH_EXPIRATION",
  "ADMIN_EMAIL",
];

const loadEnvVariables = (): IRequiredVars => {
  requiredVars.forEach((variable) => {
    if (!process.env[variable])
      throw new Error(`Missing env variable: ${variable}`);
  });

  return {
    PORT: process.env.PORT as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    DB_URL: process.env.DB_URL as string,
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,

    ADMIN: {
      ADMIN_PHONE: process.env.ADMIN_PHONE as string,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
      ADMIN_NAME: process.env.ADMIN_NAME as string,
      ADMIN_INITIAL_SYSTEM_FUND: Number(process.env.ADMIN_INITIAL_SYSTEM_FUND),
    },

    USER: {
      USER_WELCOME_BONUS: Number(process.env.USER_WELCOME_BONUS),
      USER_DAILY_CASHOUT_LIMIT: Number(process.env.USER_DAILY_CASHOUT_LIMIT),
      USER_MONTHLY_CASHOUT_LIMIT: Number(
        process.env.USER_MONTHLY_CASHOUT_LIMIT
      ),
    },

    AGENT: {
      AGENT_INITIAL_BALANCE: Number(process.env.AGENT_INITIAL_BALANCE),
      AGENT_DAILY_CASHOUT_LIMIT: Number(process.env.AGENT_DAILY_CASHOUT_LIMIT),
      AGENT_MONTHLY_CASHOUT_LIMIT: Number(
        process.env.AGENT_MONTHLY_CASHOUT_LIMIT
      ),
    },
    JWT: {
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
      JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION as string,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
      JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION as string,
    },
  };
};

export const envVars = loadEnvVariables();
