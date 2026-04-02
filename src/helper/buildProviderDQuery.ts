import { providerDMockData } from "../mockData";
import type { ProviderDRawItem } from "../types";
import { createQueryResolver } from "./createQueryResolver";
import { getValueAtDotPath } from "./getValueAtDotPath";
import { matches } from "./matches";

const QUERY_TO_FIELD_MAP = {
  main_author: "creators.main_author",
  house: "publishing.house",
  release_year: "publishing.release_year",
  isbn_13: "identifiers.isbn_13",
  book_title: "book_title",
} as const;

export const buildProviderDQuery = createQueryResolver(QUERY_TO_FIELD_MAP);

export const executeProviderDQuery = (
  searchParams: URLSearchParams,
  limit: number
): ProviderDRawItem[] => {
  const query = buildProviderDQuery(searchParams);

  if (!query) return [];

  const { field, value } = query;

  return providerDMockData
    .filter((item) => {
      const fieldValue = getValueAtDotPath(item, field as string);
      if (typeof fieldValue === "string") {
        return matches(fieldValue, value);
      }
      return String(fieldValue) === value;
    })
    .slice(0, limit);
};
