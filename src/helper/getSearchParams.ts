import type { SearchQuery } from "../types";

const getSearchParams = (
  map: Record<SearchQuery["type"], string>,
  query: SearchQuery
) => {
  const paramKey = map[query.type];
  return new URLSearchParams({
    [paramKey]: query.value,
    limit: String(query.limit),
  });
};

export default getSearchParams;
