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

router.get("/", checkAuth([IRole.ADMIN]), agentController.allAgents);

router.get(
  "/:agentId",
  checkAuth([IRole.ADMIN, IRole.AGENT]),
  agentController.getSingleAgent
);

router.patch(
  "/verify-status/:agentId",
  checkAuth([IRole.ADMIN]),
  agentController.verifyAgent
);
export const AgentRoutes = router;
