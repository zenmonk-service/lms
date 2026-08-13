export class HttpError extends Error {
  response: { status: number; data: unknown };
  constructor(status: number, data: unknown) {
    super(
      typeof data === "object" &&
        data &&
        ((data as any).title || (data as any).message)
        ? (data as any).title || (data as any).message
        : `HTTP Error: ${status}`,
    );
    this.name = "HttpError";
    this.response = { status, data };
  }
}
