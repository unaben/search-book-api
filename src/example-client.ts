import "./config";
import "./mockServer";

import {
  providerAAdapter,
  providerAXmlAdapter,
  providerBAdapter,
  providerCAdapter,
  providerEAdapter,
} from "./adapters";
import {
  getBooksByAuthor,
  getBooksByPublisher,
  getBooksByYear,
} from "./services";
import { parallelProviderSearch, singleProviderSearch } from "./helper";
import { initSearchResultLog } from "./utils/searchResultLogger";
import { logger } from "./utils";
import { providerDAdapter } from "./adapters/providerD.adapter";

const main = async (): Promise<void> => {
  await new Promise((r) => setTimeout(r, 100));

  initSearchResultLog();

  // ── Provider A: JSON ──
  await singleProviderSearch(
    "Provider A — JSON — Books by Author: Shakespeare",
    "ProviderA",
    "json",
    getBooksByAuthor(providerAAdapter, "Shakespeare", 3)
  );

  // await singleProviderSearch(
  //   "Provider A — JSON — Books by Publisher: Penguin",
  //   "ProviderA",
  //   "json",
  //   getBooksByPublisher(providerAAdapter, "Penguin", 3)
  // );

  // await singleProviderSearch(
  //   "Provider A — JSON — Books by Year: 1599",
  //   "ProviderA",
  //   "json",
  //   getBooksByYear(providerAAdapter, "1599", 3)
  // );

  // // ── Provider A: XML — same normalize(), different wire format ──
  // await singleProviderSearch(
  //   "Provider A — XML — Books by Author: Shakespeare",
  //   "ProviderA",
  //   "xml",
  //   getBooksByAuthor(providerAXmlAdapter, "Shakespeare", 3)
  // );

  // // ── Provider B: flat schema, 400ms latency ──
  // await singleProviderSearch(
  //   "Provider B — JSON — Books by Author: Orwell  [⏱ simulated latency]",
  //   "ProviderB",
  //   "json",
  //   getBooksByAuthor(providerBAdapter, "Orwell", 3)
  // );

  // await singleProviderSearch(
  //   "Provider B — JSON — Books by Publisher: Penguin  [⏱ simulated latency]",
  //   "ProviderB",
  //   "json",
  //   getBooksByPublisher(providerBAdapter, "Penguin", 3)
  // );

  // ── Provider C: nested pricing, intermittent 503 ──
  await singleProviderSearch(
    "Provider C — JSON — Books by Author: Tolkien  [⚡ simulated 503 → retry]",
    "ProviderC",
    "json",
    getBooksByAuthor(providerCAdapter, "Tolkien", 3)
  );

  // await singleProviderSearch(
  //   "Provider C — JSON — Books by Publisher: HarperCollins",
  //   "ProviderC",
  //   "json",
  //   getBooksByPublisher(providerCAdapter, "HarperCollins", 3)
  // );

  // // - parallel search

  // await parallelProviderSearch("author", "Tolkien", 3);

  // await parallelProviderSearch("publisher", "Penguin", 3, [
  //   { adapter: providerCAdapter, name: "ProviderC", format: "json" },
  // ]);

  await parallelProviderSearch("title", "Hamlet", 3, [
    { adapter: providerAAdapter, name: "ProviderA", format: "json" },
    { adapter: providerBAdapter, name: "ProviderC", format: "json" },
  ]);

  // await parallelProviderSearch("title", "Coming Up for Air", 3, [
  //   { adapter: providerCAdapter, name: "ProviderC", format: "json" },
  // ]);

  // await parallelProviderSearch('isbn', "9780451526342", 3, [
  //   { adapter: providerDAdapter, name: "ProviderC", format: "json" },
  // ]);

  await parallelProviderSearch("author", "Harper Lee", 3, [
    { adapter: providerEAdapter, name: "ProviderE", format: "json" },
  ]);

  logger.info("All queries complete", {
    resultsFile: "logs/search-results.json",
  });
};

main().catch((err) => {
  logger.error("Fatal error in main()", { err });
  process.exitCode = 1;
});
