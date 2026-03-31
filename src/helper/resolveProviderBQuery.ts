import { providerBMockData } from "../mockData";
import type { ProviderBRawItem } from "../types";
import { createQueryResolver } from "./createQueryResolver";
import { matches } from "./matches";

const QUERY_TO_FIELD_MAP = {
  writtenBy: "writtenBy",
  publisher: "publisher",
  year: "year",
  identifier: "identifier",
  name: "name",
} as const;

export const resolveProviderBQuery =
  createQueryResolver(QUERY_TO_FIELD_MAP);

export const executeProviderBQuery = (
  params: URLSearchParams,
  limit: number
): ProviderBRawItem[] => {
  const query = resolveProviderBQuery(params);

  if (!query) return [];

  const { field, value } = query;

  return providerBMockData
    .filter((item) => {
      const fieldValue = item[field];

      if (typeof fieldValue === "string") {
        return matches(fieldValue, value);
      }

      return String(fieldValue) === value;
    })
    .slice(0, limit);
};