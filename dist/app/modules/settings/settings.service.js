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
exports.settingsService = exports.systemConfig = void 0;
const settings_model_1 = require("./settings.model");
const sysSettingInit = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = yield settings_model_1.Settings.create(payload);
    return settings;
});
const getSysSettings = () => __awaiter(void 0, void 0, void 0, function* () {
    const settings = yield settings_model_1.Settings.find();
    exports.systemConfig = settings[0].toObject();
    return settings[0];
});
const sysSettingsUpdate = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const settings = yield settings_model_1.Settings.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    exports.systemConfig = settings === null || settings === void 0 ? void 0 : settings.toObject();
    return settings;
});
exports.settingsService = {
    sysSettingInit,
    getSysSettings,
    sysSettingsUpdate,
};
