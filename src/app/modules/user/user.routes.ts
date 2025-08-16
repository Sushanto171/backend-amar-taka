import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateZodSchema";
import { userController } from "./user.controller";
import { IRole } from "./user.interface";
import { CreateUserZodSchema, updateUserZodSchema } from "./user.validator";

const router = Router();

router.post(
  "/",
  validateRequest(CreateUserZodSchema),
  userController.createUser
);
router.get("/", checkAuth([IRole.ADMIN]), userController.getAllUsers);

router.get("/me", checkAuth([...Object.values(IRole)]), userController.getMe);

router.get("/:userId", userController.getSingleUser); // admin route

router.patch(
  "/:userId",
  validateRequest(updateUserZodSchema),
  userController.updateUser
);

export const UserRoutes = router;
