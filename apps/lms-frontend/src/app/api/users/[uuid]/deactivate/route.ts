import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
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
    if (org_uuid) forwardHeaders["org_uuid"] = org_uuid;
    if (authorization) forwardHeaders["authorization"] = authorization;

    const response = await axios.patch(
      `${BASE_URL}/users/${uuid}/deactivate`,
      {},
      { headers: forwardHeaders }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response.data.error },
      { status: error?.status }
    );
  }
}
