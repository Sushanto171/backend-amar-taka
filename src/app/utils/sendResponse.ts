import { Response } from "express";

interface IMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

interface ISendResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: IMeta;
  stack?: T;
}

export const sendResponse = <T>(res: Response, data: ISendResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    statusCode: data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta,
    stack: data.stack,
  });
};
