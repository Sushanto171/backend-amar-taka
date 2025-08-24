"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IWalletType = exports.ICurrency = void 0;
var ICurrency;
(function (ICurrency) {
    ICurrency["BDT"] = "BDT";
    ICurrency["USD"] = "USD";
})(ICurrency || (exports.ICurrency = ICurrency = {}));
var IWalletType;
(function (IWalletType) {
    IWalletType["PERSONAL"] = "PERSONAL";
    IWalletType["AGENT"] = "AGENT";
    IWalletType["SYSTEM"] = "SYSTEM";
})(IWalletType || (exports.IWalletType = IWalletType = {}));
