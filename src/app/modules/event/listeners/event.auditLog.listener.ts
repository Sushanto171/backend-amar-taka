import { auditLogsService } from "../../auditLogs/auditLogs.service";
import { eventBus } from "../eventBus";

eventBus.on("log", async (payload) => {
  await auditLogsService.createAuditLog(payload);
});
