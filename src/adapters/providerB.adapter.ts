import { config } from "../config";
import type {
  BookProviderAdapter,
  SearchQuery,
  Book,
  ProviderBRawItem,
} from "../types";

const QUERY_PARAM_MAP: Record<SearchQuery["type"], string> = {
  author: "writtenBy",
  publisher: "publisher",
  year: "year",
  isbn: "identifier",
  title: "name",
} as const;

export const providerBAdapter: BookProviderAdapter = {
  providerName: "ProviderB",
  baseUrl: config.providers.b,
  format: "json",

  buildUrl: (query: SearchQuery): string => {
    const paramKey = QUERY_PARAM_MAP[query.type];
    const params = new URLSearchParams({
      [paramKey]: query.value,
      limit: String(query.limit),
    });

    return `${config.providers.b}/search?${params.toString()}`;
  },

  normalize: (rawItem: unknown): Book => {
    const item = rawItem as ProviderBRawItem;
    return {
      title: item.name,
      author: item.writtenBy,
      isbn: item.identifier,
      quantity: item.availability,
      price: item.cost,
    };
  },
};
