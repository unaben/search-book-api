import http from "http";
import { URL } from "url";
import { config } from "./config";
import {
  resolveProviderAQuery,
  executeProviderAQuery,
  resolveProviderBQuery,
  executeProviderBQuery,
  resolveProviderCQuery,
  executeProviderCQuery,
  resolveProviderDQuery,
  executeProviderDQuery,
  resolveProviderEQuery,
  executeProviderEQuery,
} from "./helper";
import type { ProviderARawItem } from "./types";
import { logger } from "./utils";

type ProviderAFiltered = ProviderARawItem[];

const toXml = (books: ProviderAFiltered): string => {
  const items = books
    .map(
      ({ book, stock }) => `
    <item>
      <book>
        <title>${book.title}</title>
        <author>${book.author}</author>
        <isbn>${book.isbn}</isbn>
        <publisher>${book.publisher}</publisher>
        <year>${book.year}</year>
      </book>
      <stock>
        <quantity>${stock.quantity}</quantity>
        <price>${stock.price}</price>
      </stock>
    </item>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><books>${items}</books>`;
};

const sendJson = (
  res: http.ServerResponse,
  status: number,
  data: unknown
): void => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const sendXml = (
  res: http.ServerResponse,
  status: number,
  xml: string
): void => {
  res.writeHead(status, { "Content-Type": "application/xml" });
  res.end(xml);
};

let providerCCallCount = 0;

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${config.port}`);
  const pathname = url.pathname;
  const params = url.searchParams;
  const format = params.get("format") ?? "json";
  const limit = parseInt(
    params.get("limit") ??
      params.get("maxResults") ??
      params.get("count") ??
      "10"
  );

  logger.info("Incoming request", {
    method: req.method,
    pathname,
    params: Object.fromEntries(params.entries()),
    format,
    limit,
  });

  if (pathname.startsWith("/provider-a/")) {
    const query = resolveProviderAQuery(params, pathname);

    if (!query) {
      logger.info("Response sent", { status: 400, pathname });
      sendJson(res, 400, { error: "Invalid or missing parameters" });
      return;
    }

    const filtered = executeProviderAQuery(params, limit, pathname);

    if (format === "xml") {
      sendXml(res, 200, toXml(filtered));
    } else {
      sendJson(res, 200, filtered);
    }
    return;
  }

  if (pathname.startsWith("/provider-b/")) {
    const query = resolveProviderBQuery(params);
    if (!query) {
      sendJson(res, 400, { error: "Invalid or missing query parameters" });
      return;
    }

    const filtered = executeProviderBQuery(params, limit);

    logger.info("Provider B responding", { count: filtered.length });
    setTimeout(() => {
      logger.info("Provider B responded", { latencyMs: 400 });
      sendJson(res, 200, filtered);
    }, 400);
    return;
  }

  if (pathname.startsWith("/provider-c/")) {
    providerCCallCount++;

    if (providerCCallCount % 2 !== 0) {
      sendJson(res, 503, { error: "Service temporarily unavailable" });
      return;
    }
    const query = resolveProviderCQuery(params);

    if (!query) {
      sendJson(res, 400, { error: "Invalid or missing query parameters" });
      return;
    }

    const filtered = executeProviderCQuery(params, limit);

    logger.info("Provider C responding", { count: filtered.length });

    setTimeout(() => {
      sendJson(res, 200, filtered);
    }, 400);

    return;
  }

  if (pathname.startsWith("/provider-d/")) {
    const query = resolveProviderDQuery(params);
    if (!query) {
      sendJson(res, 400, { error: "Invalid or missing query parameters" });
      return;
    }

    const filtered = executeProviderDQuery(params, limit);

    logger.info("Provider D responding", { count: filtered.length });
    setTimeout(() => {
      logger.info("Provider D responded", { latencyMs: 400 });
      sendJson(res, 200, filtered);
    }, 400);
    return;
  }

  if (pathname.startsWith("/provider-e/")) {
    const query = resolveProviderEQuery(params);
    if (!query) {
      sendJson(res, 400, { error: "Invalid or missing query parameters" });
      return;
    }

    const filtered = executeProviderEQuery(params, limit);

    logger.info("Provider E responding", { count: filtered.length });
    setTimeout(() => {
      logger.info("Provider E responded", { latencyMs: 400 });
      sendJson(res, 200, filtered);
    }, 400);
    return;
  }

  sendJson(res, 404, { error: "Unknown route" });
});

server.listen(config.port, () => {
  logger.info("MockServer running", { url: `http://localhost:${config.port}` });
});

export default server;
