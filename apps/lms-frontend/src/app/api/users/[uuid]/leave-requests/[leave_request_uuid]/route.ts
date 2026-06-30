import { servicesAxiosInstance } from "@/config/axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  context:
    | { params: { uuid: string; leave_request_uuid: string } }
    | { params: Promise<{ uuid: string; leave_request_uuid: string }> },
) {
  try {
    const params = await context.params;
    const { uuid, leave_request_uuid } = params;
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const authorization = request.headers.get("authorization") ?? undefined;

    const headers: Record<string, string> = {};
    if (org_uuid) headers["org_uuid"] = org_uuid;
    if (authorization) headers["authorization"] = authorization;

    const response = await servicesAxiosInstance.get(
      `${BASE_URL}/users/${uuid}/leave-requests/${leave_request_uuid}`,
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

export async function PUT(
  request: NextRequest,
  context:
    | { params: { uuid: string; leave_request_uuid: string } }
    | { params: Promise<{ uuid: string; leave_request_uuid: string }> },
) {
  const params = await context.params;
  const { uuid, leave_request_uuid } = params;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const body = await request.json();

  const org_uuid = request.headers.get("org_uuid") ?? undefined;
  const authorization = request.headers.get("authorization") ?? undefined;

  const forwardHeaders: Record<string, string> = {};
  if (org_uuid) forwardHeaders["org_uuid"] = org_uuid;
  if (authorization) forwardHeaders["authorization"] = authorization;

  try {
    const response = await servicesAxiosInstance.put(
      `${BASE_URL}/users/${uuid}/leave-requests/${leave_request_uuid}`,
      body,
      {
        headers: forwardHeaders,
      },
    );

    return NextResponse.json(response.data);
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const data = err?.response?.data ?? {
      title: "Internal Server Error",
      description: "Something went wrong.",
    };
    return NextResponse.json(data, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  context:
    | { params: { uuid: string; leave_request_uuid: string } }
    | { params: Promise<{ uuid: string; leave_request_uuid: string }> },
) {
  const params = await context.params;
  const { uuid, leave_request_uuid } = params;
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const org_uuid = request.headers.get("org_uuid") ?? undefined;
  const authorization = request.headers.get("authorization") ?? undefined;

  const forwardHeaders: Record<string, string> = {};
  if (org_uuid) forwardHeaders["org_uuid"] = org_uuid;
  if (authorization) forwardHeaders["authorization"] = authorization;

  try {
    const response = await servicesAxiosInstance.delete(
      `${BASE_URL}/users/${uuid}/leave-requests/${leave_request_uuid}`,
      {
        headers: forwardHeaders,
      },
    );

    return NextResponse.json(response.data);
  } catch (err: any) {
    const status = err?.response?.status ?? 500;
    const data = err?.response?.data ?? {
      title: "Internal Server Error",
      description: "Something went wrong.",
    };
    return NextResponse.json(data, { status });
  }
}
