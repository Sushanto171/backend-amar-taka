import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { IRole } from "../user/user.interface";
import { statsController } from "./stats.controller";

const router = Router();

router.get("/user", checkAuth([IRole.ADMIN]), statsController.getUserStats);

export const StatRoutes = router;
