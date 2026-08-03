import { headers } from "next/headers";
import { HttpClient } from "./http";

export const ssoClient = new HttpClient(
  process.env.NEXT_PUBLIC_SSO_URL!,
  async () => {
    const h = await headers();
    return {
      Cookie: h.get("cookie") ?? "",
      org_uuid: h.get("org_uuid") ?? "",
      authorization: h.get("authorization") ?? "",
    };
  },
);

export const backendClient = new HttpClient(
  process.env.NEXT_PUBLIC_BACKEND_URL!,
  async () => {
    const h = await headers();
    return {
      Cookie: h.get("cookie") ?? "",
      org_uuid: h.get("org_uuid") ?? "",
      authorization: h.get("authorization") ?? "",
    };
  },
);

export const fileServiceClient = new HttpClient(
  process.env.NEXT_PUBLIC_IMAGE_SERVICE_API_URL!,
  async () => {
    const h = await headers();
    return {
      Cookie: h.get("cookie") ?? "",
      org_uuid: h.get("org_uuid") ?? "",
      authorization: h.get("authorization") ?? "",
    };
  },
);

