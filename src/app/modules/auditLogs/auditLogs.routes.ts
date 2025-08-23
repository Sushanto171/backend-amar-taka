import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { IRole } from "../user/user.interface";
import { auditController } from "./auditLogs.controller";

const router = Router();

router.get("/", checkAuth([IRole.ADMIN]), auditController.getLogs);
router.get("/:logId", checkAuth([IRole.ADMIN]), auditController.getSingleLog);

export const AuditLogsRoutes = router;
