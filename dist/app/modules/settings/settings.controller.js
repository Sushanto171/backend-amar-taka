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
exports.settingController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const https_status_codes_1 = require("../../utils/https-status-codes");
const sendResponse_1 = require("../../utils/sendResponse");
const settings_service_1 = require("./settings.service");
const getSettings = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const info = yield settings_service_1.settingsService.getSysSettings();
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Settings retrieved successfully.",
        data: info,
    });
}));
const sysSettingUpdate = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const id = req.params.id;
    const info = yield settings_service_1.settingsService.sysSettingsUpdate(id, body);
    (0, sendResponse_1.sendResponse)(res, {
        success: true,
        statusCode: https_status_codes_1.httpsStatusCodes.OK,
        message: "Settings updated successfully.",
        data: info,
    });
}));
exports.settingController = {
    getSettings,
    sysSettingUpdate,
};
