import { Router } from "express";
import { AgentRoutes } from "../modules/agent/agent.routes";

import { AuditLogsRoutes } from "../modules/auditLogs/auditLogs.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { CommissionRoutes } from "../modules/commission/commission.routes";
import { StatRoutes } from "../modules/stats/stats.routes";
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
  {
    path: "/agent",
    router: AgentRoutes,
  },
  {
    path: "/audit-logs",
    router: AuditLogsRoutes,
  },
  {
    path: "/commission",
    router: CommissionRoutes,
  },
  {
    path: "/stats",
    router: StatRoutes,
  },
];

moduleRoutes.forEach((module) => router.use(module.path, module.router));
