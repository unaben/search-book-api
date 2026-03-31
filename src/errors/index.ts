export class BookSearchError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly provider: string
  ) {
    super(message);
    this.name = "BookSearchError";
  }
}