import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateZodSchema";
import { IRole } from "../user/user.interface";
import { agentController } from "./agent.controller";
import {
  agentCoreZodSchema,
  agentStatusZodSchema,
  agentUpdateZodSchema,
} from "./agent.validator";

const router = Router();

router.post(
  "/registration",
  validateRequest(agentCoreZodSchema),
  checkAuth([IRole.USER]),
  agentController.registration
);

router.get("/", checkAuth([IRole.ADMIN]), agentController.allAgents);

router.get(
  "/:agentId",
  checkAuth([...Object.values(IRole)]),
  agentController.getSingleAgent
);

router.patch(
  "/verify-status/:agentId",
  validateRequest(agentStatusZodSchema),
  checkAuth([IRole.ADMIN]),
  agentController.verifyAgent
);

router.patch(
  "/:agentId",
  validateRequest(agentUpdateZodSchema),
  checkAuth([IRole.ADMIN, IRole.AGENT]),
  agentController.updateAgent
);

export const AgentRoutes = router;
