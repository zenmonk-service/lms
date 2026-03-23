import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> }
) {
  try {
    const params = await context.params;
    const { uuid } = params;
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const authorization = request.headers.get("authorization") ?? undefined;

    const forwardHeaders: Record<string, string> = {};
    if (org_uuid) forwardHeaders.org_uuid = org_uuid;
    if (authorization) forwardHeaders.authorization = authorization;

    const response = await axios.get(`${BASE_URL}/users/${uuid}/documents`, {
      headers: forwardHeaders,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response?.data?.error ?? "Failed to fetch documents" },
      { status: error?.response?.status ?? 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> }
) {
  try {
    const params = await context.params;
    const { uuid } = params;
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const data = await request.json();

    const org_uuid = request.headers.get("org_uuid") ?? data?.org_uuid;
    const authorization = request.headers.get("authorization") ?? undefined;

    const forwardHeaders: Record<string, string> = {};
    if (org_uuid) forwardHeaders.org_uuid = org_uuid;
    if (authorization) forwardHeaders.authorization = authorization;

    const response = await axios.post(`${BASE_URL}/users/${uuid}/documents`, data, {
      headers: forwardHeaders,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response?.data?.error ?? "Failed to create document" },
      { status: error?.response?.status ?? 500 }
    );
  }
}
