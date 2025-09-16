import { Response } from "express";
import { cookieOptions } from "./cookieOptions";
interface IAuthCookie {
  accessToken: string;
  refreshToken: string;
}

export const setAuthCookie = (res: Response, token: IAuthCookie) => {
  if (token.accessToken) {
    res.cookie("accessToken", token.accessToken, cookieOptions);
  }
  if (token.refreshToken) {
    res.cookie("refreshToken", token.refreshToken, cookieOptions);
  }
};
