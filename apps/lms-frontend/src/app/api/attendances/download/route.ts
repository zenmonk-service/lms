import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const org_uuid = request.headers.get("org_uuid") ?? undefined;

  const headers: Record<string, string> = {};
  if (org_uuid) headers["org_uuid"] = org_uuid;

  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const { searchParams } = new URL(request.url);

  const response = await servicesAxiosInstance.get(
    `${BASE_URL}/attendances/download`,
    {
      params: Object.fromEntries(searchParams),
      headers,
      responseType: "arraybuffer",
    }
  );

  return new NextResponse(response.data);
}
