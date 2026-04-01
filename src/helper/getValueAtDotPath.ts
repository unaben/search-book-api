export const getValueAtDotPath = (obj: unknown, path: string): unknown => {
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
};
