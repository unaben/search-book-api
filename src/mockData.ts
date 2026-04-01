import type {
  ProviderARawItem,
  ProviderBRawItem,
  ProviderCRawItem,
  ProviderDRawItem,
  ProviderERawItem,
} from "./types";

export const providerAMockData: Array<ProviderARawItem> = [
  {
    book: {
      title: "Hamlet",
      author: "Shakespeare",
      isbn: "978-0141396507",
      publisher: "Penguin",
      year: "1603",
    },
    stock: { quantity: 10, price: 9.99 },
  },
  {
    book: {
      title: "Othello",
      author: "Shakespeare",
      isbn: "978-0141396514",
      publisher: "Penguin",
      year: "1603",
    },
    stock: { quantity: 5, price: 7.99 },
  },
  {
    book: {
      title: "Macbeth",
      author: "Shakespeare",
      isbn: "978-0141396521",
      publisher: "Penguin",
      year: "1606",
    },
    stock: { quantity: 8, price: 8.49 },
  },
  {
    book: {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      isbn: "978-0261102217",
      publisher: "HarperCollins",
      year: "1937",
    },
    stock: { quantity: 12, price: 10.99 },
  },
  {
    book: {
      title: "1984",
      author: "George Orwell",
      isbn: "978-0141187761",
      publisher: "Penguin",
      year: "1949",
    },
    stock: { quantity: 15, price: 8.99 },
  },
  {
    book: {
      title: "Animal Farm",
      author: "George Orwell",
      isbn: "978-0141036137",
      publisher: "Penguin",
      year: "1945",
    },
    stock: { quantity: 20, price: 6.99 },
  },
  {
    book: {
      title: "The Two Towers",
      author: "J.R.R. Tolkien",
      isbn: "978-0261102361",
      publisher: "HarperCollins",
      year: "1954",
    },
    stock: { quantity: 9, price: 11.99 },
  },
  {
    book: {
      title: "A Midsummer Night Dream",
      author: "Shakespeare",
      isbn: "978-0141396538",
      publisher: "Penguin",
      year: "1600",
    },
    stock: { quantity: 6, price: 7.49 },
  },
];

export const providerBMockData: Array<ProviderBRawItem> = [
  {
    name: "1984",
    writtenBy: "George Orwell",
    identifier: "978-0141187761",
    publisher: "Penguin",
    year: "1949",
    availability: 15,
    cost: 8.99,
  },
  {
    name: "Animal Farm",
    writtenBy: "George Orwell",
    identifier: "978-0141036137",
    publisher: "Penguin",
    year: "1945",
    availability: 20,
    cost: 6.99,
  },
  {
    name: "Homage to Catalonia",
    writtenBy: "George Orwell",
    identifier: "978-0141184418",
    publisher: "Penguin",
    year: "1938",
    availability: 3,
    cost: 9.49,
  },
  {
    name: "Hamlet",
    writtenBy: "Shakespeare",
    identifier: "978-0141396507",
    publisher: "Penguin",
    year: "1603",
    availability: 8,
    cost: 9.99,
  },
  {
    name: "The Fellowship of the Ring",
    writtenBy: "J.R.R. Tolkien",
    identifier: "978-0261102354",
    publisher: "HarperCollins",
    year: "1954",
    availability: 11,
    cost: 12.99,
  },
  {
    name: "The Hobbit",
    writtenBy: "J.R.R. Tolkien",
    identifier: "978-0261102217",
    publisher: "HarperCollins",
    year: "1937",
    availability: 7,
    cost: 10.99,
  },
  {
    name: "Coming Up for Air",
    writtenBy: "George Orwell",
    identifier: "978-0141184426",
    publisher: "Penguin",
    year: "1939",
    availability: 5,
    cost: 8.49,
  },
];

export const providerCMockData: Array<ProviderCRawItem> = [
  {
    title: "The Hobbit",
    authorName: "J.R.R. Tolkien",
    isbnCode: "978-0261102217",
    publisher: "HarperCollins",
    year: "1937",
    stockCount: 12,
    pricing: { amount: 10.99 },
  },
  {
    title: "The Fellowship of the Ring",
    authorName: "J.R.R. Tolkien",
    isbnCode: "978-0261102354",
    publisher: "HarperCollins",
    year: "1954",
    stockCount: 7,
    pricing: { amount: 12.99 },
  },
  {
    title: "The Return of the King",
    authorName: "J.R.R. Tolkien",
    isbnCode: "978-0261102378",
    publisher: "HarperCollins",
    year: "1955",
    stockCount: 9,
    pricing: { amount: 12.99 },
  },
  {
    title: "Hamlet",
    authorName: "Shakespeare",
    isbnCode: "978-0141396507",
    publisher: "Penguin",
    year: "1603",
    stockCount: 10,
    pricing: { amount: 9.99 },
  },
  {
    title: "Macbeth",
    authorName: "Shakespeare",
    isbnCode: "978-0141396521",
    publisher: "Penguin",
    year: "1606",
    stockCount: 8,
    pricing: { amount: 8.49 },
  },
  {
    title: "1984",
    authorName: "George Orwell",
    isbnCode: "978-0141187761",
    publisher: "Penguin",
    year: "1949",
    stockCount: 15,
    pricing: { amount: 8.99 },
  },
];

export const providerDMockData: Array<ProviderDRawItem> = [
  {
    book_title: "Dune",
    creators: {
      main_author: "Frank Herbert",
    },
    identifiers: {
      isbn_13: "9780441013593",
    },
    publishing: {
      house: "Penguin",
      release_year: "1965",
    },
    inventory: {
      available_units: 18,
    },
    pricing_info: {
      retail: {
        value: 11.49,
        currency: "USD",
      },
    },
  },
  {
    book_title: "Dune Messiah",
    creators: {
      main_author: "Frank Herbert",
    },
    identifiers: {
      isbn_13: "9780441172696",
    },
    publishing: {
      house: "Penguin",
      release_year: "1969",
    },
    inventory: {
      available_units: 11,
    },
    pricing_info: {
      retail: {
        value: 10.99,
        currency: "USD",
      },
    },
  },
  {
    book_title: "Animal Farm",
    creators: {
      main_author: "George Orwell",
    },
    identifiers: {
      isbn_13: "9780451526342",
    },
    publishing: {
      house: "Penguin",
      release_year: "1945",
    },
    inventory: {
      available_units: 14,
    },
    pricing_info: {
      retail: {
        value: 7.99,
        currency: "USD",
      },
    },
  },
];

export const providerEMockData: Array<ProviderERawItem> = [
  {
    metadata: {
      title: "The Great Gatsby",
      publication: { year: "1925", imprint: "Scribner" },
    },
    contributors: { primary: { full_name: "F. Scott Fitzgerald" } },
    catalogue: { ean: "9780743273565" },
    warehouse: {
      stock_level: 10,
      unit_price: { amount: 9.99, currency: "USD" },
    },
  },
  {
    metadata: {
      title: "To Kill a Mockingbird",
      publication: { year: "1960", imprint: "HarperCollins" },
    },
    contributors: { primary: { full_name: "Harper Lee" } },
    catalogue: { ean: "9780061935466" },
    warehouse: {
      stock_level: 7,
      unit_price: { amount: 8.99, currency: "USD" },
    },
  },
  {
    metadata: {
      title: "Of Mice and Men",
      publication: { year: "1937", imprint: "Penguin" },
    },
    contributors: { primary: { full_name: "John Steinbeck" } },
    catalogue: { ean: "9780140177398" },
    warehouse: {
      stock_level: 5,
      unit_price: { amount: 7.49, currency: "USD" },
    },
  },
];


