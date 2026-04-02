import { providerAMockData } from "../mockData";
import type { ProviderARawItem } from "../types";
import { createQueryResolver } from "./createQueryResolver";
import { matches } from "./matches";

const QUERY_TO_FIELD_MAP = {
  author: "author",
  publisher: "publisher",
  year: "year",
  isbn: "isbn",
  title: "title",
} as const;

const PATH_TO_PARAM: Record<string, string> = {
  "by-author": "author",
  "by-publisher": "publisher",
  "by-year": "year",
  "by-isbn": "isbn",
  "by-title": "title",
};

export const buildProviderAQuery = createQueryResolver(
  QUERY_TO_FIELD_MAP,
  "q",
  PATH_TO_PARAM
);

export const executeProviderAQuery = (
  query: ReturnType<typeof buildProviderAQuery>,
  limit: number
): ProviderARawItem[] => {
  if (!query) return [];

  const { field, value } = query;

  return providerAMockData
    .filter((item) => {
      const fieldValue = item.book[field];
      if (typeof fieldValue === "string") {
        return matches(fieldValue, value);
      }
      return String(fieldValue) === value;
    })
    .slice(0, limit);
};
