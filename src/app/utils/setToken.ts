import { Response } from "express";
import { envVars } from "../config/env.config";
interface IAuthCookie {
  accessToken: string;
  refreshToken: string;
}

export const setAuthCookie = (res: Response, token: IAuthCookie) => {
  if (token.accessToken) {
    res.cookie("accessToken", token.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
    });
  }
  if (token.refreshToken) {
    res.cookie("refreshToken", token.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
    });
  }
};
