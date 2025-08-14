import { Router } from "express";
import { walletController } from "./wallet.controller";

const router = Router();

router.get("/me", walletController.me);

export const WalletRoutes = router;
