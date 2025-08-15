import { Router } from "express";
import { validateRequest } from "../../middlewares/validateZodSchema";
import { userController } from "./user.controller";
import { CreateUserZodSchema, updateUserZodSchema } from "./user.validator";

const router = Router();

router.post(
  "/",
  validateRequest(CreateUserZodSchema),
  userController.createUser
);
router.get("/", userController.getAllUsers);

router.get("/me", userController.getMe);

router.get("/:userId", userController.getSingleUser); // admin route

router.patch(
  "/:userId",
  validateRequest(updateUserZodSchema),
  userController.updateUser
);

export const UserRoutes = router;
