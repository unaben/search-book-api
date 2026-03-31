export const redactSensitiveUrlParams = (url: string): string =>
  url.replace(/([?&])(api_key|token|secret|key)=[^&]*/gi, "$1$2=***");
