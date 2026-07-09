import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const org_uuid = request.headers.get("org_uuid") ?? undefined;
  const { searchParams } = new URL(request.url);
  const headers: Record<string, string> = {};
  if (org_uuid) headers["org_uuid"] = org_uuid;
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const response = await servicesAxiosInstance.get(
      `${BASE_URL}/attendances`,
      {
        headers,
        params: Object.fromEntries(searchParams),
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

export async function POST(request: Request) {
  const org_uuid = request.headers.get("org_uuid") ?? undefined;

  const headers: Record<string, string> = {};
  if (org_uuid) headers["org_uuid"] = org_uuid;
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const body = await request.json();

    const response = await servicesAxiosInstance.post(
      `${BASE_URL}/attendances`,
      body,
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
