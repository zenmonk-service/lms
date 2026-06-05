import { servicesAxiosInstance } from "@/config/axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await context.params;

  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const authorization = request.headers.get("authorization") ?? undefined;

    const headers: Record<string, string> = {};
    if (org_uuid) headers["org_uuid"] = org_uuid;
    if (authorization) headers["authorization"] = authorization;

    const response = await servicesAxiosInstance.get(
      `${BASE_URL}/users/${uuid}/notifications`,
      { headers },
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response?.data?.error },
      { status: error?.response?.status ?? 500 },
    );
  }
}
