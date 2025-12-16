import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  context:
    | { params: { uuid: string; leave_request_uuid: string } }
    | { params: Promise<{ uuid: string; leave_request_uuid: string }> }
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
    const response = await axios.put(
      `${BASE_URL}/users/${uuid}/leave-requests/${leave_request_uuid}`,
      body,
      {
        headers: forwardHeaders,
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context:
    | { params: { uuid: string; leave_request_uuid: string } }
    | { params: Promise<{ uuid: string; leave_request_uuid: string }> }
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
    const response = await axios.delete(
      `${BASE_URL}/users/${uuid}/leave-requests/${leave_request_uuid}`,
      {
        headers: forwardHeaders,
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
}
