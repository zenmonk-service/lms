import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await context.params;
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = new URL(request.url);
    const params: Record<string, string | string[]> = {};
    const keys = new Set(Array.from(url.searchParams.keys()));

    for (const k of keys) {
      const all = url.searchParams.getAll(k);
      params[k] = all.length > 1 ? all : all[0];
    }

    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const authorization = request.headers.get("authorization") ?? undefined;

    const headers: Record<string, string> = {};
    if (org_uuid) headers["org_uuid"] = org_uuid;
    if (authorization) headers["authorization"] = authorization;

    const response = await axios.get(
      `${BASE_URL}/users/${uuid}/leave-requests`,
      { params, headers }
    );

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> }
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
    const response = await axios.post(
      `${BASE_URL}/users/${uuid}/leave-requests`,
      body,
      {
        headers: forwardHeaders,
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log("error: ", error);
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
}
