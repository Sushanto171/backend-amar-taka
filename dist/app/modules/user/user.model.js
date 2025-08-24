"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true, min: 1 },
    phone: { type: String, unique: true, required: true, min: 11, max: 14 },
    password: { type: String, required: true, select: false, min: 6, max: 6 },
    picture: { type: String },
    email: { type: String },
    wallet: { type: mongoose_1.Schema.ObjectId, ref: "Wallet" },
    agent: { type: mongoose_1.Schema.ObjectId, ref: "Agent" },
    role: {
        type: String,
        enum: [...Object.values(user_interface_1.IRole)],
        default: user_interface_1.IRole.USER,
    },
    failedLoginAttempts: { type: Number, min: 0, default: 0 },
    lockUntil: { type: Number, default: null },
    isDeleted: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
}, {
    versionKey: false,
    timestamps: true,
});
exports.User = (0, mongoose_1.model)("User", userSchema);
