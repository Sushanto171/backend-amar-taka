import { model, Schema } from "mongoose";
import { ICurrency, ILimit, IWallet, IWalletType } from "./wallet.interface";

const limitSchema = new Schema<ILimit>(
  {
    monthly: { type: Number, required: true, min: 0 },
    daily: { type: Number, required: true, min: 0 },
  },
  {
    versionKey: false,
    _id: false,
  }
);

const walletSchema = new Schema<IWallet>(
  {
    user: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    balance: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      enum: [...Object.values(ICurrency)],
      default: ICurrency.BDT,
    },
    type: {
      type: String,
      enum: [...Object.values(IWalletType)],
      default: IWalletType.PERSONAL,
    },
    limit: { type: limitSchema },
    isBlock: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
    revenue: { type: Number, min: 0 }, //only for agent/admin
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

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

export const Wallet = model<IWallet>("Wallet", walletSchema);
