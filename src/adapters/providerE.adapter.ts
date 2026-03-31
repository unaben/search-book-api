import { config } from "../config";
import type {
  BookProviderAdapter,
  SearchQuery,
  Book,
  ProviderERawItem,
} from "../types";

const QUERY_PARAM_MAP: Record<SearchQuery["type"], string> = {
  author: "full_name",
  publisher: "imprint",
  year: "year",
  isbn: "ean",
  title: "title",
};

export const providerEAdapter: BookProviderAdapter = {
  providerName: "ProviderE",
  baseUrl: config.providers.providerE,
  format: "json",

  buildUrl: (query: SearchQuery): string => {
    const paramKey = QUERY_PARAM_MAP[query.type];
    const params = new URLSearchParams({
      [paramKey]: query.value,
      limit: String(query.limit),
    });
    return `${config.providers.providerE}/search?${params.toString()}`;
  },

  normalize: (rawItem: unknown): Book => {
    const item = rawItem as ProviderERawItem;
    return {
      title: item.metadata.title,
      author: item.contributors.primary.full_name,
      isbn: item.catalogue.ean,
      quantity: item.warehouse.stock_level,
      price: item.warehouse.unit_price.amount,
    };
  },
};
