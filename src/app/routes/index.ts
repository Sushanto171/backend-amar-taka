import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { TransactionRoutes } from "../modules/transaction/transaction.routes";
import { UserRoutes } from "../modules/user/user.routes";
import { WalletRoutes } from "../modules/wallet/wallet.routes";

interface IRoute {
  path: string;
  router: Router;
}

export const router = Router();

const moduleRoutes: IRoute[] = [
  {
    path: "/user",
    router: UserRoutes,
  },
  {
    path: "/wallet",
    router: WalletRoutes,
  },
  {
    path: "/auth",
    router: AuthRoutes,
  },
  {
    path: "/transaction",
    router: TransactionRoutes,
  },
];

moduleRoutes.forEach((module) => router.use(module.path, module.router));
