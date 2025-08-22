import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { IRole } from "../user/user.interface";
import { authController } from "./auth.controller";

const router = Router();

router.post("/login", authController.login);
router.post("/refresh-token", authController.getNewAccessToken);
router.get("/logout", authController.logout);
router.post(
  "/change-password",
  checkAuth([...Object.values(IRole)]),
  authController.changePassword
);

export const AuthRoutes = router;
