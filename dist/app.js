"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const globalErrorHandler_1 = require("./app/middlewares/globalErrorHandler");
const notFound_1 = require("./app/middlewares/notFound");
require("./app/modules/event/listeners/commission.listener");
require("./app/modules/event/listeners/event.SystemUpdateListener");
require("./app/modules/event/listeners/event.sendSmsListener");
const routes_1 = require("./app/routes");
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, cookie_parser_1.default)());
exports.app.use("/api/v1", routes_1.router);
exports.app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Hello world",
    });
});
exports.app.use(notFound_1.notFound);
exports.app.use(globalErrorHandler_1.globalErrorHandler);
