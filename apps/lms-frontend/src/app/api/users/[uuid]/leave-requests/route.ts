import { servicesAxiosInstance } from "@/config/axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await context.params;
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const { searchParams } = new URL(request.url);
    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const authorization = request.headers.get("authorization") ?? undefined;

    const headers: Record<string, string> = {};
    if (org_uuid) headers["org_uuid"] = org_uuid;
    if (authorization) headers["authorization"] = authorization;

    const response = await servicesAxiosInstance.get(
      `${BASE_URL}/users/${uuid}/leave-requests`,
      { params: Object.fromEntries(searchParams), headers },
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const params = await context.params;
  const { uuid } = params;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const body = await request.json();

  const org_uuid = request.headers.get("org_uuid") ?? undefined;
  const authorization = request.headers.get("authorization") ?? undefined;

  const forwardHeaders: Record<string, string> = {};
  if (org_uuid) forwardHeaders["org_uuid"] = org_uuid;
  if (authorization) forwardHeaders["authorization"] = authorization;

  try {
    const response = await servicesAxiosInstance.post(
      `${BASE_URL}/users/${uuid}/leave-requests`,
      body,
      {
        headers: forwardHeaders,
      },
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log("error: ", error);
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status },
    );
  }
}
