import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const params = await Promise.resolve(context.params);
  const { uuid } = params;
  const org_uuid = request.headers.get("org_uuid") ?? undefined;

  const headers: Record<string, string> = {};
  if (org_uuid) headers["org_uuid"] = org_uuid;
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const response = await servicesAxiosInstance.get(
      `${BASE_URL}/users/${uuid}/attendances`,
      {
        headers,
      },
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const data = err?.response?.data ?? {
      title: "Internal Server Error",
      description: "Something went wrong.",
    };
    return NextResponse.json(data, { status });
  }
}
