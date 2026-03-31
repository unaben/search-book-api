import {
  providerAAdapter,
  providerBAdapter,
  providerCAdapter,
  providerDAdapter,
  providerEAdapter,
} from "../adapters";
import type { RetryConfig } from "../types";

export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

export const RETRYABLE_STATUS_CODES: ReadonlySet<number> = new Set([
  HTTP_STATUS.TOO_MANY_REQUESTS,
  HTTP_STATUS.INTERNAL_SERVER_ERROR,
  HTTP_STATUS.SERVICE_UNAVAILABLE,
  HTTP_STATUS.GATEWAY_TIMEOUT,
]);

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelayMs: 300,
  timeoutMs: 5000,
};

export const QUERY_LIMITS = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 100,
} as const;

export const ALL_PROVIDERS = [
  { adapter: providerAAdapter, name: "ProviderA", format: "json" },
  { adapter: providerBAdapter, name: "ProviderB", format: "json" },
  { adapter: providerCAdapter, name: "ProviderC", format: "json" },
  { adapter: providerDAdapter, name: "ProviderD", format: "json" },
  { adapter: providerEAdapter, name: "ProviderE", format: "json" },
] as const;
