import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateZodSchema";
import { userController } from "./user.controller";
import { IRole } from "./user.interface";
import {
  actionUserZodSchema,
  CreateUserZodSchema,
  updateUserZodSchema,
  verifyOTPZodSchema,
} from "./user.validator";

const router = Router();

router.post(
  "/",
  validateRequest(CreateUserZodSchema),
  userController.createUser
);

router.get(
  "/send-verify-otp",
  checkAuth([...Object.values(IRole)]),
  userController.sendVerifyOTP
);

router.post(
  "/verify-otp",
  validateRequest(verifyOTPZodSchema),
  checkAuth([...Object.values(IRole)]),
  userController.verifyOTP
);

router.get("/", checkAuth([IRole.ADMIN]), userController.getAllUsers);

router.get("/me", checkAuth([...Object.values(IRole)]), userController.getMe);

router.get("/:userId", checkAuth([IRole.ADMIN]), userController.getSingleUser); // admin route

router.patch(
  "/action",
  validateRequest(actionUserZodSchema),
  checkAuth([IRole.ADMIN]),
  userController.againstUserAction
);

router.patch(
  "/:userId",
  validateRequest(updateUserZodSchema),
  userController.updateUser
);

export const UserRoutes = router;
