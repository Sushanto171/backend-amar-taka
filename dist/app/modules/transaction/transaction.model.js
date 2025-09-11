"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const transaction_interface_1 = require("./transaction.interface");
const transactionSchema = new mongoose_1.Schema({
    fromWallet: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "Wallet",
        index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    type: {
        type: String,
        enum: [...Object.values(transaction_interface_1.ITransactionType)],
        required: true,
    },
    status: {
        type: String,
        enum: [...Object.values(transaction_interface_1.ITransactionStatus)],
        required: true,
    },
    toWallet: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Wallet",
    },
    sender: {
        type: String,
        required: true,
        min: 11,
        max: 14,
        ref: "User",
    },
    receiver: {
        type: String,
        required: true,
        min: 11,
        max: 14,
        ref: "User",
    },
    reference: { type: String },
    fee: { type: Number, required: true, min: 0 },
    bankAccount: { type: String },
    metaData: { type: mongoose_1.Schema.Types.Mixed, default: {} },
}, {
    versionKey: false,
    timestamps: true,
});
exports.Transaction = (0, mongoose_1.model)("Transaction", transactionSchema);
