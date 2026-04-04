import {
  providerAAdapter,
  providerBAdapter,
  providerCAdapter,
} from "../adapters";
import {
  parseProviderAXml,
  createProviderAAdapter,
} from "../adapters/providerA.adapter";
import { QUERY_LIMITS } from "../constants";
import { sanitizeQuery } from "../helper";
import type { Book, SearchQuery } from "../types";

const expectedBook: Book = {
  title: "Hamlet",
  author: "Shakespeare",
  isbn: "978-0141396507",
  quantity: 10,
  price: 9.99,
};

describe("providerAAdapter", () => {
  describe("toBook()", () => {
    it("maps nested book/stock schema to unified Book model", () => {
      const raw = {
        book: {
          title: "Hamlet",
          author: "Shakespeare",
          isbn: "978-0141396507",
        },
        stock: { quantity: 10, price: 9.99 },
      };
      expect(providerAAdapter.toBook(raw)).toEqual(expectedBook);
    });
  });

  describe("buildUrl()", () => {
    it("builds correct URL for author query", () => {
      const query: SearchQuery = {
        type: "author",
        value: "Shakespeare",
        limit: 10,
      };
      const url = providerAAdapter.buildUrl(query);
      expect(url).toContain("by-author");
      expect(url).toContain("Shakespeare");
      expect(url).toContain("limit=10");
    });

    it("builds correct URL for publisher query", () => {
      const query: SearchQuery = {
        type: "publisher",
        value: "Penguin",
        limit: 5,
      };
      const url = providerAAdapter.buildUrl(query);
      expect(url).toContain("by-publisher");
      expect(url).toContain("Penguin");
    });

    it("builds correct URL for year query", () => {
      const query: SearchQuery = { type: "year", value: "1999", limit: 5 };
      const url = providerAAdapter.buildUrl(query);
      expect(url).toContain("by-year");
      expect(url).toContain("1999");
    });

    it("URL-encodes spaces in query value using URLSearchParams", () => {
      const query: SearchQuery = {
        type: "author",
        value: "J K Rowling",
        limit: 5,
      };
      const url = providerAAdapter.buildUrl(query);
      expect(url).toContain("J+K+Rowling");
      expect(url).not.toContain("J K Rowling");
    });
  });
});

describe("providerBAdapter", () => {
  describe("toBook()", () => {
    it("maps flat Provider B schema (name/writtenBy/cost) to unified Book model", () => {
      const raw = {
        name: "Hamlet",
        writtenBy: "Shakespeare",
        identifier: "978-0141396507",
        availability: 10,
        cost: 9.99,
      };
      expect(providerBAdapter.toBook(raw)).toEqual(expectedBook);
    });
  });

  describe("buildUrl()", () => {
    it("builds correct URL for author query using Provider B param name", () => {
      const query: SearchQuery = { type: "author", value: "Orwell", limit: 5 };
      const url = providerBAdapter.buildUrl(query);
      expect(url).toContain("writtenBy=");
      expect(url).toContain("Orwell");
      expect(url).toContain("limit=5");
    });

    it("uses 'pub' param for publisher queries", () => {
      const query: SearchQuery = {
        type: "publisher",
        value: "Penguin",
        limit: 5,
      };
      const url = providerBAdapter.buildUrl(query);
      expect(url).toContain("publish");
    });
  });
});

describe("providerCAdapter", () => {
  describe("toBook()", () => {
    it("maps Provider C schema (authorName/isbnCode/pricing.amount) to unified Book model", () => {
      const raw = {
        title: "Hamlet",
        authorName: "Shakespeare",
        isbnCode: "978-0141396507",
        stockCount: 10,
        pricing: { amount: 9.99 },
      };
      expect(providerCAdapter.toBook(raw)).toEqual(expectedBook);
    });
  });

  describe("buildUrl()", () => {
    it("builds correct URL for author query using Provider C format", () => {
      const query: SearchQuery = { type: "author", value: "Tolkien", limit: 5 };
      const url = providerCAdapter.buildUrl(query);
      expect(url).toContain("authorName=Tolkien");
      expect(url).toContain("limit=5");
    });
  });
});

describe("Cross-provider normalization", () => {
  it("all three adapters produce the same unified Book shape", () => {
    const rawA = {
      book: { title: "Hamlet", author: "Shakespeare", isbn: "978-0141396507" },
      stock: { quantity: 10, price: 9.99 },
    };
    const rawB = {
      name: "Hamlet",
      writtenBy: "Shakespeare",
      identifier: "978-0141396507",
      availability: 10,
      cost: 9.99,
    };
    const rawC = {
      title: "Hamlet",
      authorName: "Shakespeare",
      isbnCode: "978-0141396507",
      stockCount: 10,
      pricing: { amount: 9.99 },
    };

    const normalizedA = providerAAdapter.toBook(rawA);
    const normalizedB = providerBAdapter.toBook(rawB);
    const normalizedC = providerCAdapter.toBook(rawC);

    expect(normalizedA).toEqual(normalizedB);
    expect(normalizedB).toEqual(normalizedC);
    expect(normalizedA).toEqual(expectedBook);
  });
});

describe("XML support — parseProviderAXml", () => {
  const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
    <books>
      <item>
        <book>
          <title>Hamlet</title>
          <author>Shakespeare</author>
          <isbn>978-0141396507</isbn>
        </book>
        <stock>
          <quantity>10</quantity>
          <price>9.99</price>
        </stock>
      </item>
    </books>`;

  it("parses XML string into the same object shape as JSON response", () => {
    const result = parseProviderAXml(xmlString);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      book: { title: "Hamlet", author: "Shakespeare", isbn: "978-0141396507" },
      stock: { quantity: 10, price: 9.99 },
    });
  });

  it("XML-parsed items produce the same normalized Book as JSON items", () => {
    const xmlAdapter = createProviderAAdapter("xml");
    const jsonAdapter = createProviderAAdapter("json");

    const rawFromXml = parseProviderAXml(xmlString)[0];
    const rawFromJson = {
      book: { title: "Hamlet", author: "Shakespeare", isbn: "978-0141396507" },
      stock: { quantity: 10, price: 9.99 },
    };

    expect(xmlAdapter.toBook(rawFromXml)).toEqual(
      jsonAdapter.toBook(rawFromJson)
    );
  });

  it("createProviderAAdapter sets format correctly", () => {
    expect(createProviderAAdapter("json").format).toBe("json");
    expect(createProviderAAdapter("xml").format).toBe("xml");
  });

  it("XML adapter buildUrl includes format=xml in query string", () => {
    const xmlAdapter = createProviderAAdapter("xml");
    const url = xmlAdapter.buildUrl({
      type: "author",
      value: "Shakespeare",
      limit: 5,
    });
    expect(url).toContain("format=xml");
  });

  it("JSON adapter buildUrl includes format=json in query string", () => {
    const jsonAdapter = createProviderAAdapter("json");
    const url = jsonAdapter.buildUrl({
      type: "author",
      value: "Shakespeare",
      limit: 5,
    });
    expect(url).toContain("format=json");
  });
});

describe("sanitizeQuery", () => {
  it("returns the query unchanged when values are valid", () => {
    const query = { type: "author" as const, value: "Shakespeare", limit: 10 };
    expect(sanitizeQuery(query)).toEqual(query);
  });

  it("trims whitespace from the query value", () => {
    const query = {
      type: "author" as const,
      value: "  Shakespeare  ",
      limit: 10,
    };
    expect(sanitizeQuery(query).value).toBe("Shakespeare");
  });

  it("throws when query value is empty", () => {
    const query = { type: "author" as const, value: "", limit: 10 };
    expect(() => sanitizeQuery(query)).toThrow(
      "Search query value cannot be empty"
    );
  });

  it("throws when query value is only whitespace", () => {
    const query = { type: "author" as const, value: "   ", limit: 10 };
    expect(() => sanitizeQuery(query)).toThrow(
      "Search query value cannot be empty"
    );
  });

  it("clamps limit to MIN_LIMIT when below range", () => {
    const query = { type: "author" as const, value: "Shakespeare", limit: -5 };
    expect(sanitizeQuery(query).limit).toBe(QUERY_LIMITS.MIN_LIMIT);
  });

  it("clamps limit to MAX_LIMIT when above range", () => {
    const query = {
      type: "author" as const,
      value: "Shakespeare",
      limit: 999999,
    };
    expect(sanitizeQuery(query).limit).toBe(QUERY_LIMITS.MAX_LIMIT);
  });

  it("floors decimal limit values to whole number", () => {
    const query = { type: "author" as const, value: "Shakespeare", limit: 5.9 };
    expect(sanitizeQuery(query).limit).toBe(5);
  });

  it("accepts limit at MIN_LIMIT boundary", () => {
    const query = {
      type: "author" as const,
      value: "Shakespeare",
      limit: QUERY_LIMITS.MIN_LIMIT,
    };
    expect(sanitizeQuery(query).limit).toBe(QUERY_LIMITS.MIN_LIMIT);
  });

  it("accepts limit at MAX_LIMIT boundary", () => {
    const query = {
      type: "author" as const,
      value: "Shakespeare",
      limit: QUERY_LIMITS.MAX_LIMIT,
    };
    expect(sanitizeQuery(query).limit).toBe(QUERY_LIMITS.MAX_LIMIT);
  });
});
