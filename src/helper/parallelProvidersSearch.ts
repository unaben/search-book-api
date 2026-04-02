import { ALL_PROVIDERS } from "../constants";
import { BookSearchError } from "../errors";
import {
  getBooksByAuthor,
  getBooksByPublisher,
  getBooksByYear,
  getBooksByIsbn,
  getBooksByTitle,
} from "../services";
import type { QueryType, QueryFn, ProviderEntry } from "../types";
import { logger, appendSearchResult } from "../utils";

const QUERY_FN_MAP: Record<QueryType, QueryFn> = {
  author: getBooksByAuthor,
  publisher: getBooksByPublisher,
  year: getBooksByYear,
  isbn: getBooksByIsbn,
  title: getBooksByTitle,
};

export const parallelProviderSearch = async (
  queryType: QueryType,
  value: string,
  limit: number,
  providers: Array<ProviderEntry> = [...ALL_PROVIDERS]
): Promise<void> => {
  const queryFn = QUERY_FN_MAP[queryType];

  if (!queryFn) {
    logger.error("Parallel search — unknown query type", {
      queryType,
      validTypes: Object.keys(QUERY_FN_MAP),
    });
    return;
  }

  logger.info("Parallel search started", {
    queryType,
    value,
    limit,
    providers: providers.map((p) => p.name),
  });

  const results = await Promise.allSettled(
    providers.map(({ adapter }) => queryFn(adapter, value, limit))
  );

  results.forEach((result, index) => {
    const { name, format } = providers[index];

    if (result.status === "fulfilled") {
      logger.info("Parallel search provider succeeded", {
        queryType,
        value,
        provider: name,
        count: result.value.length,
      });

      appendSearchResult(
        `Parallel — ${name} — Books by ${queryType}: ${value}`,
        name,
        format,
        result.value
      );
    } else {
      const reason =
        result.reason instanceof BookSearchError
          ? `HTTP ${result.reason.statusCode}: ${result.reason.message}`
          : String(result.reason);

      logger.warn("Parallel search provider failed", {
        queryType,
        value,
        provider: name,
        reason,
      });
    }
  });

  logger.info("Parallel search completed", {
    queryType,
    value,
    succeeded: results.filter((r) => r.status === "fulfilled").length,
    failed: results.filter((r) => r.status === "rejected").length,
  });
};
