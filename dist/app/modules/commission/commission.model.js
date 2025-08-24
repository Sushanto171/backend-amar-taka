"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commission = void 0;
const mongoose_1 = require("mongoose");
const commissionSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User" },
    fee: { type: Number, min: 0, default: 0 },
}, {
    versionKey: false,
    timestamps: true,
});
exports.Commission = (0, mongoose_1.model)("Commission", commissionSchema);
