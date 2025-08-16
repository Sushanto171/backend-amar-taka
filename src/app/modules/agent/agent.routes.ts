import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateZodSchema";
import { IRole } from "../user/user.interface";
import { agentController } from "./agent.controller";
import { agentCoreZodSchema } from "./agent.validatior";

const router = Router();

router.post(
  "/registration",
  validateRequest(agentCoreZodSchema),
  checkAuth([IRole.USER]),
  agentController.registration
);

export const AgentRoutes = router;
