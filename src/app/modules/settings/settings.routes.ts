import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { IRole } from "../user/user.interface";
import { settingController } from "./settings.controller";

const router = Router();

router.get("/", checkAuth([IRole.ADMIN]), settingController.getSettings);

router.patch(
  "/:id",
  checkAuth([IRole.ADMIN]),
  settingController.sysSettingUpdate
);

export const SettingsRoutes = router;
