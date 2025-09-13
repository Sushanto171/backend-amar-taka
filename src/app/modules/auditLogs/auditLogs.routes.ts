import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { IRole } from "../user/user.interface";
import { auditController } from "./auditLogs.controller";

const router = Router();

router.get("/", checkAuth([...Object.values(IRole)]), auditController.getLogs);
router.get(
  "/:logId",
  checkAuth([...Object.values(IRole)]),
  auditController.getSingleLog
);

export const AuditLogsRoutes = router;
