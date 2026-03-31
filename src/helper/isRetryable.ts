import { RETRYABLE_STATUS_CODES } from "../constants";

export const isRetryable = (statusCode: number): boolean =>
  RETRYABLE_STATUS_CODES.has(statusCode);
