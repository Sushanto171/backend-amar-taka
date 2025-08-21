import { Router } from "express";

import { checkAuth } from "../../../middlewares/checkAuth";
import { IRole } from "../../user/user.interface";
import { commissionController } from "./commission.controller";

const router = Router();

router.get(
  "/",
  checkAuth([IRole.ADMIN, IRole.AGENT]),
  commissionController.getCommissions
);

export const CommissionRoutes = router;
