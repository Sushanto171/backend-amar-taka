import { Response } from "express";
interface IAuthCookie {
  accessToken: string;
  refreshToken: string;
}

export const setAuthCookie = (res: Response, token: IAuthCookie) => {
  if (token.accessToken) {
    res.cookie("accessToken", token.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
  }
  if (token.refreshToken) {
    res.cookie("refreshToken", token.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
  }
};
