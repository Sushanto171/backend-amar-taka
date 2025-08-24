"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = void 0;
const generateOTP = (length) => {
    const otp = Math.floor(Math.random() * 10 ** length).toString();
    return otp;
};
exports.generateOTP = generateOTP;
