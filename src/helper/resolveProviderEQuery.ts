import { providerEBooks } from "../mockData";
import type { ProviderERawItem } from "../types";
import { createQueryResolver } from "./createQueryResolver";
import { getNestedValue } from "./getNestedValue";
import { matches } from "./matches";

const QUERY_TO_FIELD_MAP = {
  full_name: "contributors.primary.full_name",
  imprint: "metadata.publication.imprint",
  year: "metadata.publication.year",
  ean: "catalogue.ean",
  title: "metadata.title",
} as const;

export const resolveProviderEQuery = createQueryResolver(QUERY_TO_FIELD_MAP);

export const executeProviderEQuery = (
  params: URLSearchParams,
  limit: number
): ProviderERawItem[] => {
  const query = resolveProviderEQuery(params);
  if (!query) return [];

  const { field, value } = query;

  return providerEBooks
    .filter((item) => {
      const fieldValue = getNestedValue(item, field as string);
      if (typeof fieldValue === "string") {
        return matches(fieldValue, value);
      }
      return String(fieldValue) === value;
    })
    .slice(0, limit);
};
