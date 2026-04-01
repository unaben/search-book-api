import axios from "axios";
import { Mocked } from "jest-mock";
import { providerAAdapter } from "../adapters/providerA.adapter";
import { providerBAdapter } from "../adapters/providerB.adapter";
import { BookSearchError } from "../errors";
import {
  getBooksByAuthor,
  getBooksByPublisher,
  getBooksByYear,
} from "../services";
import type { Book } from "../types";

jest.mock("axios");
const mockedAxios = axios as Mocked<typeof axios>;

const providerARawResponse = [
  {
    book: { title: "Hamlet", author: "Shakespeare", isbn: "978-0141396507" },
    stock: { quantity: 10, price: 9.99 },
  },
  {
    book: { title: "Othello", author: "Shakespeare", isbn: "978-0141396508" },
    stock: { quantity: 5, price: 7.99 },
  },
];

const providerARawString = JSON.stringify(providerARawResponse);

const expectedBooks: Book[] = [
  {
    title: "Hamlet",
    author: "Shakespeare",
    isbn: "978-0141396507",
    quantity: 10,
    price: 9.99,
  },
  {
    title: "Othello",
    author: "Shakespeare",
    isbn: "978-0141396508",
    quantity: 5,
    price: 7.99,
  },
];

const providerBRawResponse = [
  {
    name: "1984",
    writtenBy: "Orwell",
    identifier: "978-0141187761",
    availability: 8,
    cost: 8.99,
  },
];

const providerBRawString = JSON.stringify(providerBRawResponse);

describe("getBooksByAuthor", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns normalised books from Provider A on success", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: providerARawString,
      status: 200,
    });

    const result = await getBooksByAuthor(providerAAdapter, "Shakespeare", 10);

    expect(result).toEqual(expectedBooks);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("Shakespeare"),
      expect.any(Object)
    );
  });

  it("returns normalised books from Provider B on success", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: providerBRawString,
      status: 200,
    });

    const result = await getBooksByAuthor(providerBAdapter, "Orwell", 5);

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe("1984");
    expect(result[0].author).toBe("Orwell");
  });

  it("returns empty array when API returns no results", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: "[]", status: 200 });

    const result = await getBooksByAuthor(
      providerAAdapter,
      "UnknownAuthor",
      10
    );

    expect(result).toEqual([]);
  });
});

describe("query types", () => {
  beforeEach(() => jest.clearAllMocks());

  it("getBooksByPublisher builds URL with publisher path", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: "[]", status: 200 });

    await getBooksByPublisher(providerAAdapter, "Penguin", 5);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("by-publisher"),
      expect.any(Object)
    );
  });

  it("getBooksByYear builds URL with year path", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: "[]", status: 200 });

    await getBooksByYear(providerAAdapter, "1999", 5);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("by-year"),
      expect.any(Object)
    );
  });
});

describe("retry mechanism", () => {
  beforeEach(() => jest.clearAllMocks());

  it("retries on 503 and succeeds on second attempt", async () => {
    const serverError = {
      response: { status: 503 },
      message: "Service Unavailable",
      code: "ERR_BAD_RESPONSE",
    };

    mockedAxios.get
      .mockRejectedValueOnce(serverError)
      .mockResolvedValueOnce({ data: providerARawString, status: 200 });

    const result = await getBooksByAuthor(providerAAdapter, "Shakespeare", 10, {
      maxRetries: 3,
      retryDelayMs: 0,
      timeoutMs: 5000,
    });

    expect(result).toEqual(expectedBooks);
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  it("throws BookSearchError after exhausting all retries", async () => {
    const serverError = {
      response: { status: 503 },
      message: "Service Unavailable",
      code: "ERR_BAD_RESPONSE",
    };

    mockedAxios.get.mockRejectedValue(serverError);

    let caughtError: unknown;
    try {
      await getBooksByAuthor(providerAAdapter, "Shakespeare", 10, {
        maxRetries: 2,
        retryDelayMs: 0,
        timeoutMs: 5000,
      });
    } catch (err) {
      caughtError = err;
    }
    expect(caughtError).toBeInstanceOf(BookSearchError);
    expect(mockedAxios.get).toHaveBeenCalledTimes(3);
  });

  it("retries on timeout (ECONNABORTED)", async () => {
    const timeoutError = { code: "ECONNABORTED", message: "timeout exceeded" };

    mockedAxios.get
      .mockRejectedValueOnce(timeoutError)
      .mockResolvedValueOnce({ data: "[]", status: 200 });

    const result = await getBooksByAuthor(providerAAdapter, "Shakespeare", 5, {
      maxRetries: 2,
      retryDelayMs: 0,
      timeoutMs: 100,
    });

    expect(result).toEqual([]);
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry on 404 (non-retryable)", async () => {
    const notFoundError = {
      response: { status: 404 },
      message: "Not Found",
      code: "ERR_BAD_RESPONSE",
    };

    mockedAxios.get.mockRejectedValue(notFoundError);

    let caughtError: unknown;
    try {
      await getBooksByAuthor(providerAAdapter, "Unknown", 5, {
        maxRetries: 3,
        retryDelayMs: 0,
        timeoutMs: 5000,
      });
    } catch (err) {
      caughtError = err;
    }
    expect(caughtError).toBeInstanceOf(BookSearchError);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });
});

describe("BookSearchError", () => {
  beforeEach(() => jest.clearAllMocks());

  it("error contains correct provider name and status code", async () => {
    const serverError = {
      response: { status: 500 },
      message: "Internal Server Error",
      code: "ERR_BAD_RESPONSE",
    };

    mockedAxios.get.mockRejectedValue(serverError);

    try {
      await getBooksByAuthor(providerAAdapter, "Shakespeare", 5, {
        maxRetries: 0,
        retryDelayMs: 0,
        timeoutMs: 5000,
      });
    } catch (err) {
      expect(err).toBeInstanceOf(BookSearchError);
      const bookErr = err as BookSearchError;
      expect(bookErr.provider).toBe("ProviderA");
      expect(bookErr.statusCode).toBe(500);
    }
  });
});
