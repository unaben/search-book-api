import { config } from "../config";
import type { BookProviderAdapter, SearchQuery, Book, ProviderCRawItem } from "../types";

const QUERY_PARAM_MAP: Record<SearchQuery["type"], string> = {
  author: "authorName",
  publisher: "publisher",
  year: "year",
  isbn: "isbnCode",
  title: "title",
} as const;

export const providerCAdapter: BookProviderAdapter = {
  providerName: "ProviderC",
  baseUrl: config.providers.c,
  format: "json",

  buildUrl: (query: SearchQuery): string => {
    const paramKey = QUERY_PARAM_MAP[query.type];
    const params = new URLSearchParams({      
      [paramKey]: query.value,
      limit: String(query.limit),
    });
    
    return `${config.providers.c}/v2/books?${params.toString()}`;
  },

  normalize: (rawItem: unknown): Book => {
    const item = rawItem as ProviderCRawItem;

    return {
      title: item.title,
      author: item.authorName,
      isbn: item.isbnCode,
      quantity: item.stockCount,
      price: item.pricing.amount,
    };
  },
};