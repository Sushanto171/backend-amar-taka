import { Router } from "express";
import { validateRequest } from "../../middlewares/validateZodSchema";
import { userController } from "./user.controller";
import { CreateUserZodSchema } from "./user.validator";

const router = Router();

router.post(
  "/",
  validateRequest(CreateUserZodSchema),
  userController.createUser
);
router.get("/", userController.getAllUsers);

export const UserRoutes = router;
