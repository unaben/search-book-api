# Book Search API

A multi-provider book search system that queries multiple book providers in parallel, normalizes their different response formats into a single unified `Book` shape, and logs the results.

---

## Summary

The application accepts a search query — by author, title, publisher, year, ISBN, or price — and fires it at multiple book provider APIs simultaneously. Each provider has its own URL structure, param naming convention, and response shape. The adapter pattern isolates all of that provider-specific knowledge so the rest of the app never has to know about it. Results are normalized, logged, and written to disk after every query.

---

## Data Flow

```
example-client.ts  (entry point)
       │
       ▼
  singleProviderSearch / parallelProviderSearch
  (Promise.allSettled fires all providers concurrently)
       │
       ▼
  getBooksByAuthor / getBooksByTitle / ...   (services)
  (createQueryExecutor factory bakes in the query type)
       │
       ▼
  fetchBooks  (providers/bookSearchClient.ts)
  (retry loop with exponential backoff)
       │
       ├── adapter.buildUrl()          adapter.normalize()
       │        │                             ▲
       │        ▼                             │
       │   HTTP GET ──────────────► mockServer.ts
       │                                      │
       │                            buildProviderXQuery()
       │                            filterProviderXBooks()
       │                            getValueAtDotPath() (D, E only)
       │                                      │
       └──────── raw JSON / XML ◄─────────────┘
       │
       ▼
  Book[]
       │
       ├──► logger (structured JSON → prettyLog in dev)
       └──► searchResultLogger (appends to search-results.json)
```

---

## Folder Structure

```
src/
├── adapters/
│   ├── index.ts
│   ├── providerA.adapter.ts
│   ├── providerB.adapter.ts
│   ├── providerC.adapter.ts
│   ├── providerD.adapter.ts
│   └── providerE.adapter.ts
│
├── constants/
│   └── index.ts
│
├── docs/
│   ├── add-new-provider.md
│   └── application-doc.md
│
├── errors/
│   └── index.ts
│
├── helper/
│   ├── buildProviderAQuery.ts
│   ├── buildProviderBQuery.ts
│   ├── buildProviderCQuery.ts
│   ├── buildProviderDQuery.ts
│   ├── buildProviderEQuery.ts
│   ├── createQueryResolver.ts
│   ├── getSearchParams.ts
│   ├── getTextContent.ts
│   ├── getValueAtDotPath.ts
│   ├── index.ts
│   ├── isRetryable.ts
│   ├── isValidBook.ts
│   ├── matches.ts
│   ├── parallelProvidersSearch.ts
│   ├── redactSensitiveUrlParams.ts
│   ├── sanitizeQuery.ts
│   ├── sendJson.ts
│   ├── sendXml.ts
│   ├── singleProviderSearch.ts
│   ├── toXml.ts
│   └── wait.ts
│
├── providers/
│   └── bookSearchClient.ts
│
├── services/
│   ├── executeBookQuery.ts
│   └── index.ts
│
├── tests/
│   ├── adapters.test.ts
│   └── bookSearchClient.test.ts
│
├── utils/
│   ├── httpClient.ts
│   ├── index.ts
│   ├── logger.ts
│   ├── prettyLog.ts
│   └── searchResultLogger.ts
│
├── config.ts
├── example-client.ts
├── mockData.ts
├── mockServer.ts
└── types.ts
```

---

## Layers

### Adapters (`src/adapters/`)

Each provider has its own adapter that implements `BookProviderAdapter`. The adapter has two responsibilities:

- `buildUrl(query)` — translates a `SearchQuery` into the URL that provider's server understands, mapping canonical query types (`author`, `title`, etc.) to provider-specific param keys.
- `normalize(rawItem)` — maps the provider's raw response shape into the shared `Book` type.

Provider A additionally supports XML responses via `parseProviderAXml`.

### Services (`src/services/`)

`executeBookQuery.ts` contains `createQueryExecutor`, a factory that creates a typed function for each query type (`getBooksByAuthor`, `getBooksByTitle`, etc.). Each executor builds a `SearchQuery` object and passes it to `fetchBooks`.

### Providers (`src/providers/`)

`bookSearchClient.ts` contains `fetchBooks`, the HTTP layer. It calls `adapter.buildUrl()`, makes the HTTP GET request via `httpGet`, handles retries with exponential backoff, and calls `adapter.normalize()` on each item in the response.

### Helpers (`src/helper/`)

| File | Purpose |
|---|---|
| `createQueryResolver.ts` | Generic factory that creates a resolver function for a given param-to-field map. Supports param-based and path-based routing via an optional `pathMap`. Used by all provider query builders. |
| `getValueAtDotPath.ts` | Traverses a nested object using a dot-notation path string e.g. `"contributors.primary.full_name"`. Used by providers D and E whose raw data is deeply nested. |
| `buildProviderAQuery.ts` | Provider A — path-based routing (`/by-author`, `/by-title`). Uses `createQueryResolver` with a `pathMap` to inject the path segment as a param before resolving. Also contains `filterProviderABooks`. |
| `buildProviderBQuery.ts` | Provider B — flat param-based routing. Contains `filterProviderBBooks`. |
| `buildProviderCQuery.ts` | Provider C — param-based routing with custom param names (`authorName`, `isbnCode`, `pricing`). Contains `filterProviderCBooks`. |
| `buildProviderDQuery.ts` | Provider D — param-based routing with dot-notation field paths for nested data access. Contains `filterProviderDBooks`. |
| `buildProviderEQuery.ts` | Provider E — param-based routing with three-level nested data access via `getValueAtDotPath`. Contains `filterProviderEBooks`. |
| `parallelProvidersSearch.ts` | Fires all providers concurrently via `Promise.allSettled`, collects and logs results independently. |
| `singleProviderSearch.ts` | Runs a single provider query, logs results, writes to file. |
| `getSearchParams.ts` | Extracts and parses `URLSearchParams` from an incoming request URL. |
| `sendJson.ts` | Writes a JSON response with the correct status code and `Content-Type` header. |
| `sendXml.ts` | Writes an XML response with the correct status code and `Content-Type` header. |
| `toXml.ts` | Serializes `ProviderARawItem[]` into an XML string for Provider A XML responses. |
| `matches.ts` | Case-insensitive string matching used by mock data filters. |
| `isRetryable.ts` | Determines whether an HTTP status code warrants a retry e.g. 503. |
| `isValidBook.ts` | Guards against malformed books before writing to the result log. |
| `sanitizeQuery.ts` | Strips sensitive values from query objects before logging. |
| `redactSensitiveUrlParams.ts` | Redacts sensitive URL params e.g. API keys before logging. |
| `getTextContent.ts` | XML DOM helper used by the Provider A XML parser. |
| `wait.ts` | Promise-based delay used for retry backoff. |

### Utils (`src/utils/`)

| File | Purpose |
|---|---|
| `httpClient.ts` | Axios-based HTTP GET with retry loop and exponential backoff. Handles both JSON and XML response parsing. |
| `logger.ts` | Structured JSON logger (info, warn, error) with timestamps and context. Writes newline-delimited JSON to `stdout` / `stderr`. |
| `prettyLog.ts` | Dev-only formatter. Reads newline-delimited JSON from `stdin` via pipe and prints colourised human-readable output to the terminal. |
| `searchResultLogger.ts` | Appends normalised `Book[]` results to `logs/search-results.json` after each query. Resets on each run via `initSearchResultLog`. |

### Mock Server (`src/mockServer.ts`)

A local HTTP server that simulates five book providers. Each provider route validates the incoming params, filters the in-memory mock data, and returns the result as JSON (or XML for Provider A).

| Provider | Routing | Simulated Behaviour |
|---|---|---|
| A | Path-based (`/by-author`, `/by-title`) | JSON and XML response formats |
| B | Param-based | 400ms latency |
| C | Param-based, custom param names | Every other request returns 503 to exercise retry logic |
| D | Param-based, nested data | Dot-notation field paths via `getValueAtDotPath` |
| E | Param-based, deeply nested data | Three-level dot-notation paths via `getValueAtDotPath` |

---

## Key Types (`src/types.ts`)

```typescript
// The canonical query shape used throughout the app
interface SearchQuery {
  type: QueryType;      // "author" | "publisher" | "year" | "isbn" | "title" | "price"
  value: string;
  limit: number;
  operator?: QueryOperator; // "eq" | "gt" | "lt" | "gte" | "lte" — for numeric fields
}

// The unified book shape all adapters normalize into
interface Book {
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  price: number;
}

// What an adapter must implement
interface BookProviderAdapter {
  providerName: string;
  baseUrl: string;
  format: ResponseFormat;
  buildUrl(query: SearchQuery): string;
  normalize(rawItem: unknown): Book;
}
```

---

## Query Resolution Flow

The adapter and mock server use two maps that must stay in sync:

```
SearchQuery["type"]          canonical type used inside the app
        │
        ▼
Adapter QUERY_PARAM_MAP      translates to the URL param key the provider expects
        │
        ▼
URL param key                travels over the wire in the HTTP request
        │
        ▼
QUERY_TO_FIELD_MAP           keys must match the URL param key exactly
        │
        ▼
Raw item field / path        flat field name or dot-notation path
        │
        ▼
getValueAtDotPath()          resolves dot-notation path into the nested raw item
                             (providers D and E only)
```

### Path-Based vs Param-Based Routing

Provider A uses path-based routing — the query type is in the URL path, not a param key. `createQueryResolver` handles this via an optional `pathMap` that injects the path segment as a param before resolving:

```
/provider-a/by-author?q=Shakespeare
        │
        ▼
pathMap["by-author"] → "author"
params.set("author", "Shakespeare")
        │
        ▼
createQueryResolver resolves "author" normally
```

All other providers use standard param-based routing:

```
/provider-c/v2/books?authorName=Tolkien
        │
        ▼
createQueryResolver finds "authorName" in params
        │
        ▼
{ field: "authorName", value: "Tolkien" }
```

---

## Running the App

```bash
# Install dependencies
npm install

# Start with pretty-printed logs (dev)
npm start

# Start with raw JSON logs (production)
npm run start:prod

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

Results are saved to `logs/search-results.json` after each run.