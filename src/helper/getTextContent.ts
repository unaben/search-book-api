/**
 * Reads the text content of the first matching child tag.
 * Returns an empty string if the tag is not found — prevents
 * crashes when optional fields are missing in an XML response.
 *
 * @example
 * getTextContent(bookElement, "title") // "Hamlet"
 */

export const getTextContent = (parent: Element, tag: string): string =>
  parent.getElementsByTagName(tag)[0]?.textContent ?? "";
