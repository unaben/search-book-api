# Book Search API

A multi-provider book search system that queries multiple book providers in parallel, normalizes their different response formats into a single unified shape, and logs the results.

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
│   └── applicationDoc.md
│
├── errors/
│   └── index.ts
│
├── helper/
│   ├── createQueryResolver.ts
│   ├── getValueAtDotPath.ts
│   ├── getTextContent.ts
│   ├── index.ts
│   ├── isRetryable.ts
│   ├── isValidBook.ts
│   ├── matches.ts
│   ├── redactSensitiveUrlParams.ts
│   ├── resolveProviderAQuery.ts
│   ├── resolveProviderBQuery.ts
│   ├── resolveProviderCQuery.ts
│   ├── resolveProviderDQuery.ts
│   ├── resolveProviderEQuery.ts
│   ├── runParallelSearch.ts
│   ├── runSingleSearch.ts
│   ├── sanitizeQuery.ts
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

## Architecture Overview

The application is split into four main concerns: **adapters**, **services**, **providers**, and **helpers**.

```
example-client.ts  (entry point)
       │
       ▼
  runSingleSearch / runParallelSearch
       │
       ▼
  getBooksByAuthor / getBooksByTitle / ...   (services)
       │
       ▼
  fetchBooks  (providers/bookSearchClient.ts)
       │
       ├── adapter.buildUrl()   →   HTTP GET   →   mockServer.ts
       │                                                │
       │                                         resolveProviderXQuery()
       │                                         executeProviderXQuery()
       │                                         getValueAtDotPath() (D, E only)
       │                                                │
       ◄───────────────── raw JSON / XML ───────────────┘
       │
       └── adapter.normalize()  →  Book[]
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
| `createQueryResolver.ts` | Generic factory that creates a resolver function for a given param-to-field map. Supports both param-based and path-based routing via an optional `pathMap`. Used by all provider executors. |
| `getValueAtDotPath.ts` | Traverses a nested object using a dot-notation path string (e.g. `"contributors.primary.full_name"`). Used by executors for providers with deeply nested raw data shapes (D, E). |
| `getTextContent.ts` | XML DOM helper used by the Provider A XML parser. |
| `resolveProviderAQuery.ts` | Provider A resolver — path-based routing (`/by-author`, `/by-title`). Uses `createQueryResolver` with a `pathMap` to inject the path segment as a param before resolving. |
| `resolveProviderBQuery.ts` | Provider B resolver — flat param-based routing. |
| `resolveProviderCQuery.ts` | Provider C resolver — param-based routing with provider-specific param names (`authorName`, `isbnCode`). |
| `resolveProviderDQuery.ts` | Provider D resolver — param-based routing with dot-notation field paths for nested data access via `getValueAtDotPath`. |
| `resolveProviderEQuery.ts` | Provider E resolver — param-based routing with three-level nested data access via `getValueAtDotPath`. |
| `runSingleSearch.ts` | Runs a single provider query, logs results, writes to file. |
| `runParallelSearch.ts` | Fires all providers concurrently via `Promise.allSettled`, collects and logs results independently. |
| `matches.ts` | Case-insensitive string matching used by mock executors. |
| `isRetryable.ts` | Determines whether an HTTP status code warrants a retry (e.g. 503). |
| `isValidBook.ts` | Guards against malformed books before writing to the result log. |
| `sanitizeQuery.ts` | Strips sensitive values from query objects before logging. |
| `redactSensitiveUrlParams.ts` | Redacts sensitive URL params (e.g. API keys) before logging. |
| `wait.ts` | Promise-based delay used for retry backoff. |

### Utils (`src/utils/`)

| File | Purpose |
|---|---|
| `httpClient.ts` | Axios-based HTTP GET with retry loop and exponential backoff. Handles both JSON and XML response parsing. |
| `logger.ts` | Structured JSON logger (info, warn, error) with timestamps and context. Writes newline-delimited JSON to `stdout` / `stderr`. |
| `prettyLog.ts` | Dev-only formatter. Reads newline-delimited JSON from `stdin` via pipe and prints colourised human-readable output to the terminal. |
| `searchResultLogger.ts` | Writes normalised `Book[]` results to `logs/search-results.json` after each query. |

### Mock Server (`src/mockServer.ts`)

A local HTTP server that simulates five book providers. Each provider route:

- Parses the incoming `URLSearchParams`
- Calls the provider's `resolveProviderXQuery` to validate params
- Calls `executeProviderXQuery` to filter mock data
- Returns the result as JSON (or XML for Provider A)

Providers also simulate real-world conditions:

| Provider | Routing | Behaviour |
|---|---|---|
| A | Path-based (`/by-author`, `/by-title`) | Supports both JSON and XML response formats |
| B | Param-based | 400ms simulated latency |
| C | Param-based with custom param names | Every other request returns 503 to exercise the retry path |
| D | Param-based with nested data | Nested data shape accessed via dot-notation paths using `getValueAtDotPath` |
| E | Param-based with deeply nested data | Three-level nested data shape accessed via `getValueAtDotPath` |

---

## Key Types (`src/types.ts`)

```typescript
// The canonical query shape used throughout the app
interface SearchQuery {
  type: QueryType;   // "author" | "publisher" | "year" | "isbn" | "title"
  value: string;
  limit: number;
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

The adapter and mock server executor use two separate maps that must stay in sync:

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
Executor QUERY_TO_FIELD_MAP  keys must match the URL param key exactly
        │
        ▼
Raw item field / path        flat field name or dot-notation path
        │
        ▼
getValueAtDotPath()             resolves dot-notation path into the nested raw item
                             (used by providers D and E only)
```

### Path-Based vs Param-Based Routing

Provider A uses path-based routing — the query type lives in the URL path rather than a param key. `createQueryResolver` handles this transparently via an optional `pathMap`:

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
{ type: "authorName", field: "authorName", value: "Tolkien" }
```

### getValueAtDotPath

Used by providers D and E whose raw data is deeply nested. Takes an object and a dot-notation path and walks down the object to return the value:

```typescript
getValueAtDotPath(item, "contributors.primary.full_name")
// → item.contributors.primary.full_name
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