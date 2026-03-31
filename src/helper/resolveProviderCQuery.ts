import { providerCMockData } from "../mockData";
import type { ProviderCRawItem } from "../types";
import { createQueryResolver } from "./createQueryResolver";
import { matches } from "./matches";

const QUERY_TO_FIELD_MAP = {
  authorName: "authorName",
  publisher: "publisher",
  year: "year",
  isbnCode: "isbnCode",
  title: "title",
} as const;

export const resolveProviderCQuery = createQueryResolver(QUERY_TO_FIELD_MAP);

export const executeProviderCQuery = (
  params: URLSearchParams,
  limit: number
): ProviderCRawItem[] => {
  const query = resolveProviderCQuery(params);  

  if (!query) return [];

  const { field, value } = query;
  return providerCMockData
    .filter((item) => {
      const fieldValue = item[field];

      if (typeof fieldValue === "string") {
        return matches(fieldValue, value);
      }

      return String(fieldValue) === value;
    })
    .slice(0, limit);
};
