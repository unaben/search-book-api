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
  toXml,
  sendJson,
  sendXml,
} from "./helper";
import { logger } from "./utils";

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

    const filteredBooks = executeProviderAQuery(query, limit);

    if (format === "xml") {
      sendXml(res, 200, toXml(filteredBooks));
    } else {
      sendJson(res, 200, filteredBooks);
    }
    return;
  }

  if (pathname.startsWith("/provider-b/")) {
    const query = resolveProviderBQuery(params);
    if (!query) {
      sendJson(res, 400, { error: "Invalid or missing query parameters" });
      return;
    }

    const filteredBooks = executeProviderBQuery(params, limit);

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
    const query = resolveProviderCQuery(params);

    if (!query) {
      sendJson(res, 400, { error: "Invalid or missing query parameters" });
      return;
    }

    const filteredBooks = executeProviderCQuery(params, limit);

    logger.info("Provider C responding", { count: filteredBooks.length });

    setTimeout(() => {
      sendJson(res, 200, filteredBooks);
    }, 400);

    return;
  }

  if (pathname.startsWith("/provider-d/")) {
    const query = resolveProviderDQuery(params);
    if (!query) {
      sendJson(res, 400, { error: "Invalid or missing query parameters" });
      return;
    }

    const filteredBooks = executeProviderDQuery(params, limit);

    logger.info("Provider D responding", { count: filteredBooks.length });
    setTimeout(() => {
      logger.info("Provider D responded", { latencyMs: 400 });
      sendJson(res, 200, filteredBooks);
    }, 400);
    return;
  }

  if (pathname.startsWith("/provider-e/")) {
    const query = resolveProviderEQuery(params);
    if (!query) {
      sendJson(res, 400, { error: "Invalid or missing query parameters" });
      return;
    }

    const filteredBooks = executeProviderEQuery(params, limit);

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
