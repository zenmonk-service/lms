import { servicesAxiosInstance } from "@/config/axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await context.params;

  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const authorization = request.headers.get("authorization") ?? undefined;

    const headers: Record<string, string> = {};
    if (org_uuid) headers["org_uuid"] = org_uuid;
    if (authorization) headers["authorization"] = authorization;

    const url = new URL(request.url);
    const params: Record<string, string | string[]> = {};
    const keys = new Set(Array.from(url.searchParams.keys()));
    for (const k of keys) {
      const all = url.searchParams.getAll(k);
      params[k] = all.length > 1 ? all : all[0];
    }

    const response = await servicesAxiosInstance.get(
      `${BASE_URL}/users/${uuid}/notifications`,
      { params, headers },
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
