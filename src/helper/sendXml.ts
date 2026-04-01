import http from "http";

export const sendXml = (
  res: http.ServerResponse,
  status: number,
  xml: string
): void => {
  res.writeHead(status, { "Content-Type": "application/xml" });
  res.end(xml);
};
