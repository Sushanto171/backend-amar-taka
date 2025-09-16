import { CookieOptions } from "express";
import { envVars } from "../config/env.config";

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
  secure: true,
  path: "/",
};
