"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSettings = void 0;
const settings_service_1 = require("../modules/settings/settings.service");
const seedSettings = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield settings_service_1.settingsService.getSysSettings();
        if (!settings) {
            const payload = {
                sysFund: 1000000000,
                deposit: {
                    min: 5000,
                    feePct: 2,
                    sysPct: 25,
                    agentPct: 75,
                },
                withdraw: {
                    min: 0,
                    feePct: 2,
                    sysPct: 50,
                    agentPct: 50,
                },
                sendMoney: {
                    perThousandFee: 500,
                    min: 20,
                },
                user: {
                    welcomeBonus: 5000,
                    dailyLimit: 2500000,
                    monthlyLimit: 5000000,
                },
                agent: {
                    initBal: 1000000,
                    dailyLimit: 5000000,
                    monthlyLimit: 20000000,
                },
            };
            yield settings_service_1.settingsService.sysSettingInit(payload);
            console.log("✍️ Settings init success");
        }
        else {
            console.log("🛠️ sysSettings already exist.");
        }
    }
    catch (error) {
        console.log("❌ Settings error:", error);
    }
});
exports.seedSettings = seedSettings;
