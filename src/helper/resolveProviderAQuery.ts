import { providerABooks } from "../mockData";
import { ProviderARawItem } from "../types";
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

export const resolveProviderAQuery = createQueryResolver(
  QUERY_TO_FIELD_MAP,
  "q",
  PATH_TO_PARAM
);

export const executeProviderAQuery = (
  params: URLSearchParams,
  limit: number,
  pathname?: string
): ProviderARawItem[] => {
  const query = resolveProviderAQuery(params, pathname);
  if (!query) return [];

  const { field, value } = query;

  return providerABooks
    .filter((item) => {
      const fieldValue = item.book[field as keyof ProviderARawItem["book"]];
      if (typeof fieldValue === "string") {
        return matches(fieldValue, value);
      }
      return String(fieldValue) === value;
    })
    .slice(0, limit);
};
