import { Router } from "express";
import { AgentRoutes } from "../modules/agent/agent.routes";

import { AuditLogsRoutes } from "../modules/auditLogs/auditLogs.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { CommissionRoutes } from "../modules/commission/commission.routes";
import { OtpRoutes } from "../modules/otp/otp.routes";
import { SettingsRoutes } from "../modules/settings/settings.routes";
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
    path: "/otp",
    router: OtpRoutes,
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
  {
    path: "/settings",
    router: SettingsRoutes,
  },
];

moduleRoutes.forEach((module) => router.use(module.path, module.router));
