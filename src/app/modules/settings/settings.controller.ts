import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { settingsService } from "./settings.service";

const getSettings = catchAsync(async (req, res) => {
  const body = req.body;
  const info = await settingsService.sysSettingInit(body);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Settings retrieved successfully.",
    data: info,
  });
});

const sysSettingUpdate = catchAsync(async (req, res) => {
  const body = req.body;
  const id = req.params.id;
  const info = await settingsService.sysSettingsUpdate(id, body);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Settings updated successfully.",
    data: info,
  });
});

export const settingController = {
  getSettings,

  sysSettingUpdate,
};
