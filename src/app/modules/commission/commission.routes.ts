import { Router } from "express";

import { checkAuth } from "../../middlewares/checkAuth";
import { IRole } from "../user/user.interface";
import { commissionController } from "./commission.controller";

const router = Router();

router.get(
  "/all-commissions",
  checkAuth([IRole.ADMIN]),
  commissionController.getAllCommissions
);
router.get(
  "/",
  checkAuth([IRole.ADMIN, IRole.AGENT]),
  commissionController.getCommissions
);
router.get(
  "/:commissionId",
  checkAuth([IRole.ADMIN, IRole.AGENT]),
  commissionController.getSingleCommission
);

export const CommissionRoutes = router;
