import { providerEMockData } from "../mockData";
import type { ProviderERawItem } from "../types";
import { createQueryResolver } from "./createQueryResolver";
import { getValueAtDotPath } from "./getValueAtDotPath";
import { matches } from "./matches";

const QUERY_TO_FIELD_MAP = {
  full_name: "contributors.primary.full_name",
  imprint: "metadata.publication.imprint",
  year: "metadata.publication.year",
  ean: "catalogue.ean",
  title: "metadata.title",
} as const;

export const buildProviderEQuery = createQueryResolver(QUERY_TO_FIELD_MAP);

export const executeProviderEQuery = (
  searchParams: URLSearchParams,
  limit: number
): ProviderERawItem[] => {
  const query = buildProviderEQuery(searchParams);
  if (!query) return [];

  const { field, value } = query;

  return providerEMockData
    .filter((item) => {
      const fieldValue = getValueAtDotPath(item, field as string);
      if (typeof fieldValue === "string") {
        return matches(fieldValue, value);
      }
      return String(fieldValue) === value;
    })
    .slice(0, limit);
};
