import { servicesAxiosInstance } from "@/config/axios";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

export async function GET(
  request: Request,
  context:
    | { params: { user_uuid: string } }
    | { params: Promise<{ user_uuid: string }> },
) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const routeParams = await context.params;
    const { user_uuid } = routeParams;

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") ?? undefined;

    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const authorization = request.headers.get("authorization") ?? undefined;

    const headers: Record<string, string> = {};
    if (org_uuid) headers["org_uuid"] = org_uuid;
    if (authorization) headers["authorization"] = authorization;

    const resp = await servicesAxiosInstance.get(
      `${BASE_URL}/leave-types/user/${user_uuid}/balances`,
      {
        params: {
          ...(period ? { period } : {}),
        },
        headers,
      },
    );

    return NextResponse.json(resp.data, { status: resp.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response?.data?.error ?? "Failed to fetch leave balances" },
      { status: error?.response?.status ?? 500 },
    );
  }
}