"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const mongoose_1 = require("mongoose");
const wallet_interface_1 = require("./wallet.interface");
const limitSchema = new mongoose_1.Schema({
    monthly: { type: Number, default: 0, min: 0 },
    daily: { type: Number, default: 0, min: 0 },
}, {
    versionKey: false,
    _id: false,
});
const walletSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, required: true, ref: "User" },
    balance: { type: Number, required: true, min: 0 },
    currency: {
        type: String,
        enum: [...Object.values(wallet_interface_1.ICurrency)],
        default: wallet_interface_1.ICurrency.BDT,
    },
    type: {
        type: String,
        enum: [...Object.values(wallet_interface_1.IWalletType)],
        default: wallet_interface_1.IWalletType.PERSONAL,
    },
    limit: { type: limitSchema },
    isBlock: { type: Boolean, default: false },
    metadata: { type: mongoose_1.Schema.Types.Mixed, default: {} },
    revenue: { type: Number, min: 0 }, //only for agent/admin
}, {
    timestamps: true,
    versionKey: false,
});
// Pre-validate hook to require revenue for agents/admins
// walletSchema.pre("validate", async function (next) {
//   try {
//     const wallet = this as IWallet;
//     const user = await User.findById(wallet.user).lean();
//     if (!user) {
//       return next(
//         new AppError(httpsStatusCodes.NOT_FOUND, "User does not exit.")
//       );
//     }
//     if (
//       (user.role === IRole.AGENT || user.role === IRole.ADMIN) &&
//       !wallet.revenue
//     ) {
//       return next(
//         new AppError(
//           httpsStatusCodes.BAD_REQUEST,
//           "Revenue is required for agents/admins"
//         )
//       );
//     }
//     next();
//   } catch (error: any) {
//     console.log("Wallet creation error:", error.message);
//     next(error);
//   }
// });
exports.Wallet = (0, mongoose_1.model)("Wallet", walletSchema);
