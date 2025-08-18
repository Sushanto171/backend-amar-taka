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
  const agentId = req.params.agentId;
  const agentInfo = await agentService.getSingleAgent(agentId);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Agent retrieved successfully",
    data: agentInfo,
  });
});

const verifyAgent = catchAsync(async (req, res) => {
 const agent = await agentService.verifyAgent(req);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Agent status updated successfully",
    data: agent,
  });
});

const updateAgent = catchAsync(async (req, res) => {
  const decoded = req.user;
  const agentId = req.params.agentId;
  const updatedInfo = await agentService.updateAgent(
    decoded,
    agentId,
    req.body
  );
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Agent info updated successfully",
    data: updatedInfo,
  });
});

const allAgents = catchAsync(async (req, res) => {
  const agents = await agentService.allAgents();
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "All agents retrieved successfully.",
    data: agents,
  });
});

export const agentController = {
  registration,
  getSingleAgent,
  verifyAgent,
  updateAgent,
  allAgents,
};
