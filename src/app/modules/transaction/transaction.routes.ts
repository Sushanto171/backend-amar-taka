import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
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

export const TransactionRoutes = router;
