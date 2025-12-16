import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const body = await request.json();

    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const authorization = request.headers.get("authorization") ?? undefined;

    const forwardHeaders: Record<string, string> = {};
    if (org_uuid) forwardHeaders["org_uuid"] = org_uuid;
    if (authorization) forwardHeaders["authorization"] = authorization;

    const resp = await axios.post(`${BASE_URL}/leave-types`, body, {
      headers: forwardHeaders,
    });

    return NextResponse.json(resp.data, { status: resp.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.response.data.error },
      { status: err?.status }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const body = await request.json();

    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const authorization = request.headers.get("authorization") ?? undefined;

    const forwardHeaders: Record<string, string> = {};
    if (org_uuid) forwardHeaders["org_uuid"] = org_uuid;
    if (authorization) forwardHeaders["authorization"] = authorization;

    const resp = await axios.put(`${BASE_URL}/leave-types/${body.leave_type_uuid}`, body, {
      headers: forwardHeaders,
    });

    return NextResponse.json(resp.data, { status: resp.status });
  } catch (err: any) {
        return NextResponse.json(
      { error: err?.response.data.error },
      { status: err?.status }
    );
  }
}


export async function GET(request: Request) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    const url = new URL(request.url);
    const params: Record<string, string> = {};
    url.searchParams.forEach((v, k) => (params[k] = v));

    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const authorization = request.headers.get("authorization") ?? undefined;

    const headers: Record<string, string> = {};
    if (org_uuid) headers["org_uuid"] = org_uuid;
    if (authorization) headers["authorization"] = authorization;

    const resp = await axios.get(`${BASE_URL}/leave-types`, {
      params,
      headers,
    });

    return NextResponse.json(resp.data, { status: resp.status });
  } catch (error: any) {
        return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
}
