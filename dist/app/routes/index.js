"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const agent_routes_1 = require("../modules/agent/agent.routes");
const auditLogs_routes_1 = require("../modules/auditLogs/auditLogs.routes");
const auth_routes_1 = require("../modules/auth/auth.routes");
const commission_routes_1 = require("../modules/commission/commission.routes");
const otp_routes_1 = require("../modules/otp/otp.routes");
const settings_routes_1 = require("../modules/settings/settings.routes");
const stats_routes_1 = require("../modules/stats/stats.routes");
const transaction_routes_1 = require("../modules/transaction/transaction.routes");
const user_routes_1 = require("../modules/user/user.routes");
const wallet_routes_1 = require("../modules/wallet/wallet.routes");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        router: user_routes_1.UserRoutes,
    },
    {
        path: "/otp",
        router: otp_routes_1.OtpRoutes,
    },
    {
        path: "/wallet",
        router: wallet_routes_1.WalletRoutes,
    },
    {
        path: "/auth",
        router: auth_routes_1.AuthRoutes,
    },
    {
        path: "/transaction",
        router: transaction_routes_1.TransactionRoutes,
    },
    {
        path: "/agent",
        router: agent_routes_1.AgentRoutes,
    },
    {
        path: "/audit-logs",
        router: auditLogs_routes_1.AuditLogsRoutes,
    },
    {
        path: "/commission",
        router: commission_routes_1.CommissionRoutes,
    },
    {
        path: "/stats",
        router: stats_routes_1.StatRoutes,
    },
    {
        path: "/settings",
        router: settings_routes_1.SettingsRoutes,
    },
];
moduleRoutes.forEach((module) => exports.router.use(module.path, module.router));
