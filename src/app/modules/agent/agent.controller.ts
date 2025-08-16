import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { agentService } from "./agent.service";

const registration = catchAsync(async (req, res) => {
  const payload = req.body;
  const userId = req.user.userId;
  const registrationInfo = await agentService.registration(userId, payload);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.CREATED,
    message: "Agent registration successfully.",
    data: registrationInfo,
  });
});

const getSingleAgent = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Agent retrieved successfully",
    data: null,
  });
});

const verifyAgent = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Agent status updated successfully",
    data: null,
  });
});

const updateAgent = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Agent info updated successfully",
    data: null,
  });
});

const allAgents = catchAsync(async (req, res) => {
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "",
    data: null,
  });
});

export const agentController = {
  registration,
  getSingleAgent,
  verifyAgent,
  updateAgent,
  allAgents,
};
