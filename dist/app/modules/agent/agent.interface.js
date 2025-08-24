"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IAgentStatus = exports.IKYCStatus = void 0;
var IKYCStatus;
(function (IKYCStatus) {
    IKYCStatus["PENDING"] = "PENDING";
    IKYCStatus["VERIFIED"] = "VERIFIED";
    IKYCStatus["REJECTED"] = "REJECTED";
})(IKYCStatus || (exports.IKYCStatus = IKYCStatus = {}));
var IAgentStatus;
(function (IAgentStatus) {
    IAgentStatus["ACTIVE"] = "ACTIVE";
    IAgentStatus["INACTIVE"] = "INACTIVE";
})(IAgentStatus || (exports.IAgentStatus = IAgentStatus = {}));
