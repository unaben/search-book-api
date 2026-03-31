export const createQueryResolver =
  <TMap extends Record<string, unknown>>(
    map: TMap,
    fallbackKey = "q",
    pathMap?: Record<string, string>
  ) =>
  (
    params: URLSearchParams,
    pathname?: string
  ): { type: keyof TMap; field: TMap[keyof TMap]; value: string } | null => {

    // 1. Path-based routing — inject path segment as param
    if (pathMap && pathname) {
      const pathSegment = pathname.split("/")[2];
      const paramKey = pathMap[pathSegment];
      const q = params.get(fallbackKey);

      if (paramKey && q) {
        params.set(paramKey, q);
      }
    }

    // 2. Try to find an exact matching key in the map
    const keys = Object.keys(map) as Array<keyof TMap>;
    const type = keys.find((k) => params.has(k as string));

    if (type) {
      const value = params.get(type as string);
      if (!value) return null;
      return { type, field: map[type], value };
    }

    // 3. No match found
    return null;
  };