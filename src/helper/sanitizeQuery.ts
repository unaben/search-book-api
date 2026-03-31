import { QUERY_LIMITS } from "../constants";
import { SearchQuery } from "../types";

export const sanitizeQuery = (query: SearchQuery): SearchQuery => {
  const trimmed = query.value.trim();

  if (!trimmed) {
    throw new Error(`Search query value cannot be empty`);
  }

  const clampedLimit = Math.min(
    Math.max(Math.floor(query.limit), QUERY_LIMITS.MIN_LIMIT),
    QUERY_LIMITS.MAX_LIMIT
  );

  return {
    ...query,
    value: trimmed,
    limit: clampedLimit,
  };
};
