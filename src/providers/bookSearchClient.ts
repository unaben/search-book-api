import { DEFAULT_RETRY_CONFIG, HTTP_STATUS } from "../constants";
import { BookSearchError } from "../errors";
import { redactSensitiveUrlParams, sanitizeQuery } from "../helper";
import type {
  Book,
  BookProviderAdapter,
  RetryConfig,
  SearchQuery,
} from "../types";
import { httpGet, logger  } from "../utils";

export const fetchBooks = async (
  adapter: BookProviderAdapter,
  query: SearchQuery,
  retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<Book[]> => {
  const sanitizedQuery = sanitizeQuery(query);
  const url = adapter.buildUrl(query);

  logger.info("Fetching books", {
    provider: adapter.providerName,
    format: adapter.format,
    queryType: sanitizedQuery.type,
    queryValue: sanitizedQuery.value,
    limit: sanitizedQuery.limit,
    url: redactSensitiveUrlParams(url),
  });

  try {
    const rawBooksResponse = await httpGet<unknown[]>(
      url,
      adapter.providerName,
      adapter.format,
      retryConfig
    );
    
    const books = rawBooksResponse.map((item) => adapter.normalize(item));

    logger.info("Books fetched successfully", {
      provider: adapter.providerName,
      format: adapter.format,
      count: books.length,
    });

    return books;
  } catch (err) {
    if (err instanceof BookSearchError) {
      logger.error("BookSearchError caught in fetchBooks", {
        provider: err.provider,
        statusCode: err.statusCode,
        message: err.message,
      });
      throw err;
    }

    logger.error("Unexpected error in fetchBooks", {
      provider: adapter.providerName,
      error: String(err),
    });

    throw new BookSearchError(
      `Unexpected error from ${adapter.providerName}`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      adapter.providerName
    );
  }
};
