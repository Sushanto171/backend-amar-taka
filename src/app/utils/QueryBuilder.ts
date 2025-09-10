import { Query } from "mongoose";
import { excludeFields } from "../constant";

export class QueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public readonly query: Record<string, string>;
  constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
    this.modelQuery = modelQuery;
    this.query = query;
  }
  filter(): this {
    const filter = { ...this.query };
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    excludeFields.forEach((field) => delete filter[field]);
    this.modelQuery = this.modelQuery.find(filter);
    return this;
  }
  search(searchableFields: string[]): this {
    const searchTerm = this.query?.searchTerm || "";
    const searchTermArr = searchTerm.split(",");

    if (searchTerm) {
      const regexCondition: { $or: Record<string, { $regex: string; $options: string; }>[]; }[] = [];
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
  fields(): this {
    const fields = this.query?.field?.split(",").join(" ") || "";
    if (fields) {
      this.modelQuery = this.modelQuery.find().select(fields);
    }
    return this;
  }
  sort(): this {
    const sort = this.query?.sort || "-createdAt";
    this.modelQuery = this.modelQuery.sort(sort);
    return this;
  }
  paginate(): this {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const skip = (page - 1) * limit;
    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }
  build() {
    return this.modelQuery;
  }

  async getMeta(condition = false) {
    const queryConditions = this.modelQuery.getFilter();

    const totalDocuments = await this.modelQuery.model.countDocuments(
      condition ? queryConditions : {}
    );
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const totalPages = Math.ceil(totalDocuments / limit);
    return {
      page,
      limit,
      total: totalDocuments,
      totalPages,
    };
  }
}
