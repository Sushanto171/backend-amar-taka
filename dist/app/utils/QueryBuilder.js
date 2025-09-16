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
exports.QueryBuilder = void 0;
const constant_1 = require("../constant");
class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    filter() {
        const filter = Object.assign({}, this.query);
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        constant_1.excludeFields.forEach((field) => delete filter[field]);
        this.modelQuery = this.modelQuery.find(filter);
        return this;
    }
    search(searchableFields) {
        var _a;
        const searchTerm = ((_a = this.query) === null || _a === void 0 ? void 0 : _a.searchTerm) || "";
        const searchTermArr = searchTerm.split(",");
        if (searchTerm) {
            const regexCondition = [];
            searchTermArr.map((value) => {
                const term = {
                    $or: searchableFields.map((field) => ({
                        [field]: { $regex: value, $options: "i" },
                    })),
                };
                regexCondition.push(term);
            });
            this.modelQuery = this.modelQuery.find({ $or: regexCondition });
        }
        return this;
    }
    fields() {
        var _a, _b;
        const fields = ((_b = (_a = this.query) === null || _a === void 0 ? void 0 : _a.field) === null || _b === void 0 ? void 0 : _b.split(",").join(" ")) || "";
        if (fields) {
            this.modelQuery = this.modelQuery.find().select(fields);
        }
        return this;
    }
    sort() {
        var _a;
        const sort = ((_a = this.query) === null || _a === void 0 ? void 0 : _a.sort) || "-createdAt";
        this.modelQuery = this.modelQuery.sort(sort);
        return this;
    }
    paginate() {
        var _a, _b;
        const page = Number((_a = this.query) === null || _a === void 0 ? void 0 : _a.page) || 1;
        const limit = Number((_b = this.query) === null || _b === void 0 ? void 0 : _b.limit) || 10;
        const skip = (page - 1) * limit;
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }
    build() {
        return this.modelQuery;
    }
    getMeta() {
        return __awaiter(this, arguments, void 0, function* (condition = false) {
            var _a, _b;
            const queryConditions = this.modelQuery.getFilter();
            const hasConditions = Object.values(queryConditions).length > 0;
            const totalDocuments = yield this.modelQuery.model.countDocuments(condition || hasConditions ? queryConditions : {});
            const page = Number((_a = this.query) === null || _a === void 0 ? void 0 : _a.page) || 1;
            const limit = Number((_b = this.query) === null || _b === void 0 ? void 0 : _b.limit) || 10;
            const totalPages = Math.ceil(totalDocuments / limit);
            return {
                page,
                limit,
                total: totalDocuments,
                totalPages,
            };
        });
    }
}
exports.QueryBuilder = QueryBuilder;
