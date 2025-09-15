import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { IRole } from "../user/user.interface";
import { statsController } from "./stats.controller";

const router = Router();

router.get("/user", checkAuth([IRole.ADMIN]), statsController.getUserStats);
router.get("/agent", checkAuth([IRole.ADMIN]), statsController.getAgentStats);
router.get(
  "/transaction",
  checkAuth([IRole.ADMIN]),
  statsController.getTransactionStats
);
router.get("/system", checkAuth([IRole.ADMIN]), statsController.getSystemStats);

export const StatRoutes = router;
