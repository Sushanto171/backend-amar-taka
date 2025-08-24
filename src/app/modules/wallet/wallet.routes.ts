import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { checkWallet } from "../../middlewares/checkWallet";
import { validateRequest } from "../../middlewares/validateZodSchema";
import { transactionActionZodSchema } from "../transaction/transaction.validator";
import { IRole } from "../user/user.interface";
import { walletController } from "./wallet.controller";
import { walletActionZodSchema } from "./wallet.validator";

const router = Router();

router.get(
  "/",
  checkAuth([...Object.values(IRole)]),
  walletController.myWallet
);
router.get(
  "/all-wallets",
  checkAuth([IRole.ADMIN]),
  walletController.getAllWallets
);
router.get(
  "/:walletId",
  checkAuth([IRole.ADMIN]),
  walletController.getSingleWallet
);

router.patch(
  "/action",
  validateRequest(walletActionZodSchema),
  checkAuth([IRole.ADMIN]),
  walletController.againstWalletAction
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

export const WalletRoutes = router;
