import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { IRole } from "../user/user.interface";
import { transactionController } from "./transaction.controller";

const router = Router();

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
