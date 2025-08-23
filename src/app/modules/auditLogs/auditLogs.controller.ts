import { catchAsync } from "../../utils/catchAsync";
import { httpsStatusCodes } from "../../utils/https-status-codes";
import { sendResponse } from "../../utils/sendResponse";
import { auditLogsService } from "./auditLogs.service";

const getLogs = catchAsync(async (req, res) => {
  const info = await auditLogsService.getLogs(
    req.query as Record<string, string>
  );
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved all logs data",
    data: info.logs,
    meta: info.meta,
  });
});

const getSingleLog = catchAsync(async (req, res) => {
  const logId = req.params.logId;
  const log = await auditLogsService.getSingleLogs(logId);
  sendResponse(res, {
    success: true,
    statusCode: httpsStatusCodes.OK,
    message: "Retrieved all logs data",
    data: log,
  });
});

export const auditController = {
  getLogs,
  getSingleLog,
};
