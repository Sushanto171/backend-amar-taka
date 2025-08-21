import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { checkWallet } from "../../middlewares/checkWallet";
import { validateRequest } from "../../middlewares/validateZodSchema";
import { transactionActionZodSchema } from "../transaction/transaction.validator";
import { IRole } from "../user/user.interface";
import { walletController } from "../wallet/wallet.controller";
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
  checkAuth([IRole.ADMIN, IRole.AGENT]),
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

router.post(
  "/deposit",
  validateRequest(transactionActionZodSchema),
  checkAuth([IRole.AGENT]),
  checkWallet,
  walletController.deposit
);
router.post(
  "/withdraw",
  validateRequest(transactionActionZodSchema),
  checkAuth([IRole.USER]),
  checkWallet,
  walletController.withdraw
);

router.post(
  "/send-money",
  validateRequest(transactionActionZodSchema),
  checkAuth([IRole.USER]),
  checkWallet,
  walletController.P2P
);

export const AgentRoutes = router;
