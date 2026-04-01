import http from "http";

export const sendJson = (
  res: http.ServerResponse,
  status: number,
  data: unknown
): void => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};