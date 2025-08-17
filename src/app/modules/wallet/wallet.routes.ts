import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { IRole } from "../user/user.interface";
import { walletController } from "./wallet.controller";

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

export const WalletRoutes = router;
