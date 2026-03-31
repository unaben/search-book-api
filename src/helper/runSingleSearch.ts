import { BookSearchError } from "../errors";
import type { Book } from "../types";
import { logger, appendSearchResult } from "../utils";

export const runSingleSearch = async (
  label:    string,
  provider: string,
  format:   string,
  query:    Promise<Book[]>
): Promise<void> => {
 
  logger.info("Single query started", { label, provider, format });
 
  try {
    const books = await query;
 
    logger.info("Single query completed", {
      label,
      provider,
      format,
      count: books.length,
    });
 
    appendSearchResult(label, provider, format, books);
 
  } catch (err) {
    if (err instanceof BookSearchError) {
      logger.error("Single query failed", {
        label,
        provider:   err.provider,
        statusCode: err.statusCode,
        message:    err.message,
      });
    } else {
      logger.error("Single query unexpected error", { label, error: String(err) });
    }
  }
};