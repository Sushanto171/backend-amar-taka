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
const twilio_config_1 = require("../../../config/twilio.config");
const eventBus_1 = require("../eventBus");
eventBus_1.eventBus.on("sendSms", (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    yield (0, twilio_config_1.sendMessage)("+8801791407583", payload.message);
}));
