# Adding a New Provider — Provider E

A step-by-step guide for adding a new deeply nested provider to the book search system. Follow these steps in order.

---

## Mapping Chain

Before writing any code, define how the query type flows through the system:

```
SearchQuery type  →  URL param key  →  QUERY_TO_FIELD_MAP value
"author"          →  "full_name"    →  "contributors.primary.full_name"
"publisher"       →  "imprint"      →  "metadata.publication.imprint"
"year"            →  "year"         →  "metadata.publication.year"
"isbn"            →  "ean"          →  "catalogue.ean"
"title"           →  "title"        →  "metadata.title"
```

---

## Step 1 — Define the Type

Add the raw item shape to `src/types.ts`:

```typescript
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
```

---

## Step 2 — Add Mock Data

Add the in-memory dataset to `src/mockData.ts`:

```typescript
export const providerEBooks: Array<ProviderERawItem> = [
  {
    metadata: {
      title: "The Great Gatsby",
      publication: { year: "1925", imprint: "Scribner" },
    },
    contributors: { primary: { full_name: "F. Scott Fitzgerald" } },
    catalogue: { ean: "9780743273565" },
    warehouse: { stock_level: 10, unit_price: { amount: 9.99, currency: "USD" } },
  },
  {
    metadata: {
      title: "To Kill a Mockingbird",
      publication: { year: "1960", imprint: "HarperCollins" },
    },
    contributors: { primary: { full_name: "Harper Lee" } },
    catalogue: { ean: "9780061935466" },
    warehouse: { stock_level: 7, unit_price: { amount: 8.99, currency: "USD" } },
  },
  {
    metadata: {
      title: "Of Mice and Men",
      publication: { year: "1937", imprint: "Penguin" },
    },
    contributors: { primary: { full_name: "John Steinbeck" } },
    catalogue: { ean: "9780140177398" },
    warehouse: { stock_level: 5, unit_price: { amount: 7.49, currency: "USD" } },
  },
];
```

---

## Step 3 — Add to Config

Add the environment variable to `src/config.ts`:

```typescript
export const config = {
  port: parseInt(process.env["PORT"] ?? "8080", 10),
  providers: {
    e: requireEnv("PROVIDER_E_BASE_URL"), // ← add
  },
} as const;
```

Add to `.env`:

```bash
PROVIDER_E_BASE_URL=http://localhost:8080/provider-e
```

---

## Step 4 — Create the Executor

Create `src/helper/buildProviderEQuery.ts`:

```typescript
import { providerEBooks } from "../mockData";
import type { ProviderERawItem } from "../types";
import { createQueryResolver } from "./createQueryResolver";
import { getValueAtDotPath } from "./getValueAtDotPath";
import { matches } from "./matches";

const QUERY_TO_FIELD_MAP = {
  full_name: "contributors.primary.full_name",
  imprint:   "metadata.publication.imprint",
  year:      "metadata.publication.year",
  ean:       "catalogue.ean",
  title:     "metadata.title",
} as const;

export type QueryEType = keyof typeof QUERY_TO_FIELD_MAP;

export const buildProviderEQuery = createQueryResolver(QUERY_TO_FIELD_MAP);

export const executeProviderEQuery = (
  searchParams: URLSearchParams,
  limit: number
): ProviderERawItem[] => {
  const query = buildProviderEQuery(searchParams);
  if (!query) return [];

  const { field, value } = query;

  return providerEBooks
    .filter((item) => {
      const fieldValue = getValueAtDotPath(item, field as string);
      if (typeof fieldValue === "string") {
        return matches(fieldValue, value);
      }
      return String(fieldValue) === value;
    })
    .slice(0, limit);
};
```

---

## Step 5 — Create the Adapter

Create `src/adapters/providerE.adapter.ts`:

```typescript
import { config } from "../config";
import type { BookProviderAdapter, SearchQuery, Book, ProviderERawItem } from "../types";

const QUERY_PARAM_MAP: Record<SearchQuery["type"], string> = {
  author:    "full_name",
  publisher: "imprint",
  year:      "year",
  isbn:      "ean",
  title:     "title",
};

export const providerEAdapter: BookProviderAdapter = {
  providerName: "ProviderE",
  baseUrl: config.providers.e,
  format: "json",

  buildUrl: (query: SearchQuery): string => {
    const paramKey = QUERY_PARAM_MAP[query.type];
    const searchParams = new URLSearchParams({
      [paramKey]: query.value,
      limit: String(query.limit),
    });
    return `${config.providers.e}/search?${searchParams.toString()}`;
  },

  normalize: (rawItem: unknown): Book => {
    const item = rawItem as ProviderERawItem;
    return {
      title:    item.metadata.title,
      author:   item.contributors.primary.full_name,
      isbn:     item.catalogue.ean,
      quantity: item.warehouse.stock_level,
      price:    item.warehouse.unit_price.amount,
    };
  },
};
```

---

## Step 6 — Add to Mock Server

Import and add the Provider E handler in `src/mockServer.ts`:

```typescript
import {
  executeProviderEQuery,
  buildProviderEQuery,
} from "./helper";

if (pathname.startsWith("/provider-e/")) {
  const query = buildProviderEQuery(searchParams);
  if (!query) {
    sendJson(res, 400, { error: "Invalid or missing query parameters" });
    return;
  }

  const filteredBooks = executeProviderEQuery(searchParams, limit);

  logger.info("Provider E responding", { count: filteredBooks.length });
  setTimeout(() => {
    logger.info("Provider E responded", { latencyMs: 400 });
    sendJson(res, 200, filteredBooks);
  }, 400);
  return;
}
```

---

## Step 7 — Register in ALL_PROVIDERS

Add the adapter to `src/constants/index.ts` so it is included in parallel searches by default:

```typescript
import {
  providerEAdapter, // ← add
} from "../adapters";

export const ALL_PROVIDERS = [
  { adapter: providerEAdapter, name: "ProviderE", format: "json" }, // ← add
] as const;
```

This is what powers `parallelProviderSearch` when no explicit providers are passed — every provider in this list will be queried.

---

## Step 8 — Export and Use

Export from the index files:

```typescript
// src/adapters/index.ts
export { providerEAdapter } from "./providerE.adapter";

// src/helper/index.ts
export { buildProviderEQuery, executeProviderEQuery } from "./buildProviderEQuery";
```

Use in `src/example-client.ts`:

```typescript
import { providerEAdapter } from "./adapters";

await parallelProviderSearch("author", "Harper Lee", 3, [
  { adapter: providerEAdapter, name: "ProviderE", format: "json" },
]);
```

---

## Checklist

- [ ] Type added to `types.ts`
- [ ] Mock data added to `mockData.ts`
- [ ] Env var added to `config.ts` and `.env`
- [ ] Executor created in `helper/buildProviderEQuery.ts`
- [ ] Adapter created in `adapters/providerE.adapter.ts`
- [ ] Handler added to `mockServer.ts`
- [ ] Adapter registered in `constants/index.ts` `ALL_PROVIDERS`
- [ ] Exported from `adapters/index.ts` and `helper/index.ts`
- [ ] Used in `example-client.ts`