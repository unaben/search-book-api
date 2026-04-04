import { ALL_PROVIDERS } from "./constants";

export interface Book {
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  price: number;
}

export type ResponseFormat = "json" | "xml";

export type QueryType = "author" | "publisher" | "year" | "isbn" | "title";

export interface SearchQuery {
  type: QueryType;
  value: string;
  limit: number;
}

export interface BookProviderAdapter {
  readonly providerName: string;
  readonly baseUrl: string;
  readonly format: ResponseFormat;
  buildUrl: (query: SearchQuery) => string;
  toBook: (rawItem: unknown) => Book;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelayMs: number;
  timeoutMs: number;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  provider: string;
}

export type ProviderEntry = (typeof ALL_PROVIDERS)[number];

export type QueryFn = (
  adapter: BookProviderAdapter,
  value: string,
  limit: number,
  retryConfig?: RetryConfig
) => Promise<Book[]>;

export interface ProviderARawItem {
  book: {
    title: string;
    author: string;
    isbn: string;
    publisher: string;
    year: string;
  };
  stock: { quantity: number; price: number };
}

export interface ProviderBRawItem {
  name: string;
  writtenBy: string;
  identifier: string;
  availability: number;
  cost: number;
  publisher: string;
  year: string;
}

export interface ProviderCRawItem {
  title: string;
  authorName: string;
  isbnCode: string;
  stockCount: number;
  pricing: { amount: number };
  publisher: string;
  year: string;
}

export type ProviderDRawItem = {
  book_title: string;
  creators: {
    main_author: string;
  };
  identifiers: {
    isbn_13: string;
  };
  publishing: {
    house: string;
    release_year: string;
  };
  inventory: {
    available_units: number;
  };
  pricing_info: {
    retail: {
      value: number;
      currency: string;
    };
  };
};

export type ProviderERawItem = {
  metadata: {
    title: string;
    publication: {
      year: string;
      imprint: string;
    };
  };
  contributors: {
    primary: {
      full_name: string;
    };
  };
  catalogue: {
    ean: string;
  };
  warehouse: {
    stock_level: number;
    unit_price: {
      amount: number;
      currency: string;
    };
  };
};

export type TypeQuery = SearchQuery["type"];

export type QueryValueMap = {
  author: string;
  publisher: string;
  year: string;
  isbn: string;
  title: string;
};

export type QueryBuilderMap = {
  [K in QueryType]: (value: QueryValueMap[K], limit: number) => SearchQuery;
};


export type ProviderAFiltered = ProviderARawItem[];