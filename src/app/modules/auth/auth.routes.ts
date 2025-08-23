import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateZodSchema";
import { IRole } from "../user/user.interface";
import { authController } from "./auth.controller";
import { resetPasswordZodSchema } from "./auth.validator";

const router = Router();

router.post("/login", authController.login);
router.post("/refresh-token", authController.getNewAccessToken);
router.get("/logout", authController.logout);
router.post(
  "/change-password",
  checkAuth([...Object.values(IRole)]),
  authController.changePassword
);
router.post(
  "/change-password-otp-verify",
  checkAuth([...Object.values(IRole)]),
  authController.verifyChangePasswordOtp
);

router.post("/forget-password", authController.forgetPassword);
router.post(
  "/reset-password",
  validateRequest(resetPasswordZodSchema),
  authController.resetPassword
);

export const AuthRoutes = router;
