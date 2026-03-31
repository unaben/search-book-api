import type { Book } from "../types";

export const isValidBook = (item: unknown): item is Book => {
    const book = item as Book;
    return (
      typeof book.title    === "string" &&
      typeof book.author   === "string" &&
      typeof book.isbn     === "string" &&
      typeof book.quantity === "number" &&
      typeof book.price    === "number"
    );
  };
  