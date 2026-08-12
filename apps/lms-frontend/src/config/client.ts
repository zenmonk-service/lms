import { HttpClient } from "./http";

export const bffClient = new HttpClient(
  `${process.env.NEXT_PUBLIC_BASE_URL}/api`,
);
