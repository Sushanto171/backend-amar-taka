import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setToken";
import { authService } from "./auth.service";

const login = catchAsync(async (req, res) => {
  const response = await authService.login(req.body, req);
  setAuthCookie(res, response.userToken);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Your login successfully.",
    data: { user: response.user, ...response.userToken },
  });
});

const getNewAccessToken = catchAsync(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const token = await authService.getNewAccessToken(refreshToken);
  setAuthCookie(res, token);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Successfully get new access token",
    data: token,
  });
});

export const authController = {
  login,
  getNewAccessToken,
};
