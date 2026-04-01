import { config } from "../config";
import type {
  BookProviderAdapter,
  SearchQuery,
  Book,
  ProviderDRawItem,
} from "../types";

const QUERY_PARAM_MAP: Record<SearchQuery["type"], string> = {
  author: "main_author",
  publisher: "house",
  year: "release_year",
  isbn: "isbn_13",
  title: "book_title",
};

export const providerDAdapter: BookProviderAdapter = {
  providerName: "ProviderD",
  baseUrl: config.providers.providerD,
  format: "json",

  buildUrl: (query: SearchQuery): string => {
    const paramKey = QUERY_PARAM_MAP[query.type];
    const searchParams = new URLSearchParams({
      [paramKey]: query.value,
      limit: String(query.limit),
    });
    return `${config.providers.providerD}/search?${searchParams.toString()}`;
  },

  normalize: (rawItem: unknown): Book => {
    const item = rawItem as ProviderDRawItem;
    return {
      title: item.book_title,
      author: item.creators.main_author,
      isbn: item.identifiers.isbn_13,
      quantity: item.inventory.available_units,
      price: item.pricing_info.retail.value,
    };
  },
};
