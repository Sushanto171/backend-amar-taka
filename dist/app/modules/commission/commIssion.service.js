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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commissionService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const QueryBuilder_1 = require("./../../utils/QueryBuilder");
const commission_model_1 = require("./commission.model");
//admin route
const getAllCommissions = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const queryBuilder = new QueryBuilder_1.QueryBuilder(commission_model_1.Commission.find(), query)
        .sort()
        .paginate();
    const [commissions, meta] = yield Promise.all([
        queryBuilder.build(),
        queryBuilder.getMeta(),
    ]);
    return { commissions, meta };
});
const getCommissions = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const commissions = yield commission_model_1.Commission.find({ user: userId });
    return commissions;
});
const getSingleCommission = (userId, commissionId) => __awaiter(void 0, void 0, void 0, function* () {
    const commission = yield commission_model_1.Commission.findOne({
        id: new mongoose_1.default.Types.ObjectId(commissionId),
        user: userId,
    });
    return commission;
});
exports.commissionService = {
    getAllCommissions,
    getCommissions,
    getSingleCommission,
};
