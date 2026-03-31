import axios, { AxiosError } from "axios";
import type { RetryConfig, ResponseFormat } from "../types";
import { logger } from "./logger";
import { parseProviderAXml } from "../adapters/providerA.adapter";
import { HTTP_STATUS } from "../constants";
import { isRetryable, wait, redactSensitiveUrlParams } from "../helper";
import { BookSearchError } from "../errors";

export const httpGet = async <T>(
  url: string,
  provider: string,
  format: ResponseFormat,
  config: RetryConfig
): Promise<T> => {
  let attempt = 0;

  const acceptHeader =
    format === "xml" ? "application/xml" : "application/json";

  while (attempt <= config.maxRetries) {
    try {
      logger.info("HTTP request attempt", {
        url: redactSensitiveUrlParams(url),
        provider,
        format,
        attempt: attempt + 1,
      });
      const response = await axios.get<string>(url, {
        timeout: config.timeoutMs,
        headers: { Accept: acceptHeader },
        responseType: "text",
        transformResponse: [(data) => data],
      });

      let parsedResponse: T;
      
      if (format === "xml") {
        parsedResponse = parseProviderAXml(response.data) as T;
      } else {
        parsedResponse = JSON.parse(response.data) as T;
      }

      logger.info("HTTP request success", {
        url: redactSensitiveUrlParams(url),
        provider,
        format,
        status: response.status,
      });
      return parsedResponse;
    } catch (err) {
      const axiosErr = err as AxiosError;
      const statusCode =
        axiosErr.response?.status ?? HTTP_STATUS.INTERNAL_SERVER_ERROR;
      const isTimeout = axiosErr.code === "ECONNABORTED";
      const shouldRetry =
        (isRetryable(statusCode) || isTimeout) && attempt < config.maxRetries;

      logger.warn("HTTP request failed", {
        url,
        provider,
        format,
        attempt: attempt + 1,
        statusCode,
        isTimeout,
        willRetry: shouldRetry,
        error: axiosErr.message,
      });

      if (!shouldRetry) {
        throw new BookSearchError(
          `Request to ${provider} failed after ${attempt + 1} attempt(s): ${
            axiosErr.message
          }`,
          statusCode,
          provider
        );
      }

      const delay = config.retryDelayMs * Math.pow(2, attempt);
      logger.info("Retrying after delay", { provider, delayMs: delay });
      await wait(delay);
      attempt++;
    }
  }

  throw new BookSearchError(
    `Request to ${provider} exhausted all retries`,
    HTTP_STATUS.SERVICE_UNAVAILABLE,
    provider
  );
};
