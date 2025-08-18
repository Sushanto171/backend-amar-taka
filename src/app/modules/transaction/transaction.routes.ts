import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { checkWallet } from "../../middlewares/checkWallet";
import { validateRequest } from "../../middlewares/validateZodSchema";
import { IRole } from "../user/user.interface";
import { transactionController } from "./transaction.controller";
import { transactionZodSchema } from "./transaction.validator";

const router = Router();

router.post(
  "/",
  validateRequest(transactionZodSchema),
  checkAuth([...Object.values(IRole)]),
  transactionController.createTransaction
);

router.get(
  "/",
  checkAuth([...Object.values(IRole)]),
  transactionController.getTransactionByUserId
);
router.get(
  "/all-transactions",
  checkAuth([IRole.ADMIN]),
  transactionController.getAllTransactions
);
router.get(
  "/:transactionId",
  checkAuth([...Object.values(IRole)]),
  transactionController.getSingleTransaction
);

router.post(
  "/deposit",
  checkAuth([IRole.AGENT]),
  checkWallet,
  transactionController.deposit
);
router.post(
  "/withdraw",
  checkAuth([IRole.USER]),
  checkWallet,
  transactionController.withdraw
);

router.post(
  "/send-money",
  checkAuth([IRole.USER]),
  checkWallet,
  transactionController.P2P
);

export const TransactionRoutes = router;
