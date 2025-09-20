/* eslint-disable @typescript-eslint/no-explicit-any */
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
      const orConditions: Record<string, any>[] = [];
      searchTermArr.forEach((value) => {
        searchableFields.forEach((field) => {
          if (field === "amount" || field === "fee") {
            if (!isNaN(Number(value))) {
              orConditions.push({ [field]: Number(value) });
            }
          } else {
            orConditions.push({
              [field]: {
                $regex: value,
                $options: "i",
              },
            });
          }
        });
      });

      if (orConditions.length > 0) {
        this.modelQuery = this.modelQuery.find({ $or: orConditions });
      }
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

  async getMeta(condition = true) {
    const queryConditions = this.modelQuery.getFilter();
    const hasConditions = Object.values(queryConditions).length > 0;
    const totalDocuments = await this.modelQuery.model.countDocuments(
      condition || hasConditions ? queryConditions : {}
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
