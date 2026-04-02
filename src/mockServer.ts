import http from "http";
import { URL } from "url";
import { config } from "./config";
import {
  buildProviderAQuery,
  executeProviderAQuery,
  buildProviderBQuery,
  executeProviderBQuery,
  buildProviderCQuery,
  executeProviderCQuery,
  buildProviderDQuery,
  executeProviderDQuery,
  buildProviderEQuery,
  executeProviderEQuery,
  toXml,
  sendJson,
  sendXml,
} from "./helper";
import { logger } from "./utils";

let providerCCallCount = 0;

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${config.port}`);
  const pathname = url.pathname;
  const searchParams = url.searchParams;
  const format = searchParams.get("format") ?? "json";
  const limit = parseInt(
    searchParams.get("limit") ??
      searchParams.get("maxResults") ??
      searchParams.get("count") ??
      "10"
  );

  logger.info("Incoming request", {
    method: req.method,
    pathname,
    searchParams: Object.fromEntries(searchParams.entries()),
    format,
    limit,
  });

  if (pathname.startsWith("/provider-a/")) {
    const query = buildProviderAQuery(searchParams, pathname);

    if (!query) {
      logger.info("Response sent", { status: 400, pathname });
      sendJson(res, 400, { error: "Invalid or missing parameters" });
      return;
    }

    const filteredBooks = executeProviderAQuery(query, limit);

    if (format === "xml") {
      sendXml(res, 200, toXml(filteredBooks));
    } else {
      sendJson(res, 200, filteredBooks);
    }
    return;
  }

  if (pathname.startsWith("/provider-b/")) {
    const query = buildProviderBQuery(searchParams);
    if (!query) {
      sendJson(res, 400, { error: "Invalid or missing query parameters" });
      return;
    }

    const filteredBooks = executeProviderBQuery(searchParams, limit);

    logger.info("Provider B responding", { count: filteredBooks.length });
    setTimeout(() => {
      logger.info("Provider B responded", { latencyMs: 400 });
      sendJson(res, 200, filteredBooks);
    }, 400);
    return;
  }

  if (pathname.startsWith("/provider-c/")) {
    providerCCallCount++;

    if (providerCCallCount % 2 !== 0) {
      sendJson(res, 503, { error: "Service temporarily unavailable" });
      return;
    }
    const query = buildProviderCQuery(searchParams);

    if (!query) {
      sendJson(res, 400, { error: "Invalid or missing query parameters" });
      return;
    }

    const filteredBooks = executeProviderCQuery(searchParams, limit);

    logger.info("Provider C responding", { count: filteredBooks.length });

    setTimeout(() => {
      sendJson(res, 200, filteredBooks);
    }, 400);

    return;
  }

  if (pathname.startsWith("/provider-d/")) {
    const query = buildProviderDQuery(searchParams);
    if (!query) {
      sendJson(res, 400, { error: "Invalid or missing query parameters" });
      return;
    }

    const filteredBooks = executeProviderDQuery(searchParams, limit);

    logger.info("Provider D responding", { count: filteredBooks.length });
    setTimeout(() => {
      logger.info("Provider D responded", { latencyMs: 400 });
      sendJson(res, 200, filteredBooks);
    }, 400);
    return;
  }

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

  sendJson(res, 404, { error: "Unknown route" });
});

server.listen(config.port, () => {
  logger.info("MockServer running", { url: `http://localhost:${config.port}` });
});

export default server;
