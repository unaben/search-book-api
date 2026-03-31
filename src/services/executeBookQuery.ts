import { fetchBooks } from "../providers/bookSearchClient";
import type {
  BookProviderAdapter,
  RetryConfig,
  Book,
  QueryBuilderMap,
  QueryValueMap,
  TypeQuery,
} from "../types";

const queryBuilders: QueryBuilderMap = {
  author: (value, limit) => ({ type: "author", value, limit }),
  publisher: (value, limit) => ({ type: "publisher", value, limit }),
  year: (value, limit) => ({ type: "year", value, limit }),
  isbn: (value, limit) => ({ type: "isbn", value, limit }),
  title: (value, limit) => ({ type: "title", value, limit }),
};

const executeBookQuery = <T extends TypeQuery>(
  adapter: BookProviderAdapter,
  type: T,
  value: QueryValueMap[T],
  limit: number,
  retryConfig?: RetryConfig
): Promise<Book[]> => {
  const searchQuery = queryBuilders[type](value, limit); 
  return fetchBooks(adapter, searchQuery, retryConfig);
};

const createQueryExecutor = <T extends TypeQuery>(type: T) => {
  return (
    adapter: BookProviderAdapter,
    value: QueryValueMap[T],
    limit: number,
    retryConfig?: RetryConfig
  ): Promise<Book[]> => {
    return executeBookQuery(adapter, type, value, limit, retryConfig);
  };
};

export const getBooksByAuthor = createQueryExecutor("author");
export const getBooksByPublisher = createQueryExecutor("publisher");
export const getBooksByYear = createQueryExecutor("year");
export const getBooksByIsbn = createQueryExecutor("isbn");
export const getBooksByTitle = createQueryExecutor("title");
