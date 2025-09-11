import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateZodSchema";
import { userController } from "./user.controller";
import { IRole } from "./user.interface";
import {
  actionUserZodSchema,
  CreateUserZodSchema,
  updateUserZodSchema,
} from "./user.validator";

const router = Router();

router.post(
  "/",
  validateRequest(CreateUserZodSchema),
  userController.createUser
);

router.get(
  "/",
  checkAuth([...Object.values(IRole)]),
  userController.getAllUsers
);

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
