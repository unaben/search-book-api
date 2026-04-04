import { config } from "../config";
import { getSearchParams } from "../helper";
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
    const searchParams = getSearchParams(QUERY_PARAM_MAP, query) 
    return `${config.providers.providerE}/search?${searchParams.toString()}`;
  },

  toBook: (rawItem: unknown): Book => {
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
