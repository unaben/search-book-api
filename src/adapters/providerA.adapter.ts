import { DOMParser as XmlDOMParser } from "@xmldom/xmldom";
import { config } from "../config";
import { getTextContent } from "../helper";
import type {
  SearchQuery,
  ResponseFormat,
  BookProviderAdapter,
  Book,
  ProviderARawItem,
} from "../types";

const QUERY_PATH_MAP: Record<SearchQuery["type"], string> = {
  author: "by-author",
  publisher: "by-publisher",
  year: "by-year",
  isbn: "by-isbn",
  title: "by-title",
};

export const parseProviderAXml = (xmlString: string): unknown[] => {
  const parser = new XmlDOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");
  const items = Array.from(doc.getElementsByTagName("item"));

  return items.map((item) => {
    const book = item.getElementsByTagName("book")[0];
    const stock = item.getElementsByTagName("stock")[0];
    return {
      book: {
        title: getTextContent(book, "title"),
        author: getTextContent(book, "author"),
        isbn: getTextContent(book, "isbn"),
      },
      stock: {
        quantity: Number(getTextContent(stock, "quantity")),
        price: Number(getTextContent(stock, "price")),
      },
    };
  });
};

export const createProviderAAdapter = (
  format: ResponseFormat = "json"
): BookProviderAdapter => {
  const baseUrl = config.providers.providerA;

  return {
    providerName: "ProviderA",
    baseUrl,
    format,

    buildUrl: (query: SearchQuery): string => {
      const path = QUERY_PATH_MAP[query.type];
      const searchParams = new URLSearchParams({
        q: query.value,
        limit: String(query.limit),
        format,
      });
      return `${baseUrl}/${path}?${searchParams.toString()}`;
    },

    toBook: (rawItem: unknown): Book => {
      const item = rawItem as ProviderARawItem;
      return {
        title: item.book.title,
        author: item.book.author,
        isbn: item.book.isbn,
        quantity: item.stock.quantity,
        price: item.stock.price,
      };
    },
  };
};

export const providerAAdapter = createProviderAAdapter("json");
export const providerAXmlAdapter = createProviderAAdapter("xml");
