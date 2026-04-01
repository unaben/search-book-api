import type { ProviderAFiltered } from "../types";

export const toXml = (books: ProviderAFiltered): string => {
  const items = books
    .map(
      ({ book, stock }) => `
      <item>
        <book>
          <title>${book.title}</title>
          <author>${book.author}</author>
          <isbn>${book.isbn}</isbn>
          <publisher>${book.publisher}</publisher>
          <year>${book.year}</year>
        </book>
        <stock>
          <quantity>${stock.quantity}</quantity>
          <price>${stock.price}</price>
        </stock>
      </item>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><books>${items}</books>`;
};
