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
exports.updateTransactionBalance = exports.IncType = void 0;
const wallet_model_1 = require("../modules/wallet/wallet.model");
var IncType;
(function (IncType) {
    IncType["increment"] = "+";
    IncType["decrement"] = "-";
})(IncType || (exports.IncType = IncType = {}));
const updateTransactionBalance = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield wallet_model_1.Wallet.findByIdAndUpdate(payload.walletId, {
        $inc: Object.assign({ balance: payload.incType + payload.balance }, (payload.revenue && { revenue: +payload.revenue })),
    }, { session: payload.session, runValidators: true, new: true });
    return user;
});
exports.updateTransactionBalance = updateTransactionBalance;
