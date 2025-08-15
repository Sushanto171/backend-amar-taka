import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { setAuthCookie } from "../../utils/setToken";
import { authService } from "./auth.service";

const login = catchAsync(async (req, res) => {
  const response = await authService.login(req.body);
  setAuthCookie(res, response.userToken);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Your login successfully.",
    data: { user: response.user, ...response.userToken },
  });
});

export const authController = {
  login,
};
