import fs from "fs";
import path from "path";
import type { Book } from "../types";
import { isValidBook } from "../helper";

const LOG_DIR = path.resolve(process.cwd(), "logs");
const RESULT_FILE = path.join(LOG_DIR, "search-results.json");

interface SearchResult {
  query: string;
  provider: string;
  format: string;
  count: number;
  books: Book[];
}

interface SearchResultFile {
  runAt: string;
  results: SearchResult[];
}

let currentRun: SearchResultFile = {
  runAt: new Date().toISOString(),
  results: [],
};

export const initSearchResultLog = (): void => {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    if (fs.existsSync(RESULT_FILE)) {
      fs.unlinkSync(RESULT_FILE);
    }

    currentRun = {
      runAt: new Date().toISOString(),
      results: [],
    };
  } catch (err) {
    process.stderr.write(
      `[searchResultLogger] Failed to initialize: ${String(err)}\n`
    );
  }
};

export const writeSearchResult = (
  query: string,
  provider: string,
  format: string,
  books: Book[]
): void => {
  try {
    const validBooks = books.filter(isValidBook);
    const invalidCount = books.length - validBooks.length;

    process.stderr.write(
      `[searchResultLogger] books received: ${books.length}\n`
    );
    process.stderr.write(
      `[searchResultLogger] valid books: ${books.filter(isValidBook).length}\n`
    );

    if (invalidCount > 0) {
      process.stderr.write(
        `[searchResultLogger] Dropped ${invalidCount} invalid book(s) from "${query}"\n`
      );
    }

    currentRun.results.push({
      query,
      provider,
      format,
      count: validBooks.length,
      books: validBooks,
    });

    fs.writeFileSync(RESULT_FILE, JSON.stringify(currentRun, null, 2), "utf8");
  } catch (err) {
    process.stderr.write(
      `[searchResultLogger] Failed to write result: ${String(err)}\n`
    );
  }
};
