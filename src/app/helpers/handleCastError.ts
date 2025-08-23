import httpStatus from "http-status-codes";
import { TGenericErrorTypes } from "../interfaces/ErrorTypes";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleCastError = (err: any): TGenericErrorTypes => {
  const match = err.message.match(
    /Cast to (\w+) failed for value "?([^"\s]+)"? \(type \w+\) at path "([^"]+)"(?: for model "([^"]+)")?/
  );
  const [, expectedType, value, field, model] = match;
  const readable = `The value "${value}" is not a valid "${expectedType}" for the field "${field}" ${
    model ? `in the "${model}" model ` : ""
  }.`;
  return {
    status: httpStatus.BAD_REQUEST,
    message: readable,
  };
};
