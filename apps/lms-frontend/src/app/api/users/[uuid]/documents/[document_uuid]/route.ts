import { servicesAxiosInstance } from "@/config/axios";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  context:
    | { params: { uuid: string; document_uuid: string } }
    | { params: Promise<{ uuid: string; document_uuid: string }> }
) {
  try {
    const params = await context.params;
    const { uuid, document_uuid } = params;
    const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

    const org_uuid = request.headers.get("org_uuid") ?? undefined;
    const authorization = request.headers.get("authorization") ?? undefined;

    const forwardHeaders: Record<string, string> = {};
    if (org_uuid) forwardHeaders.org_uuid = org_uuid;
    if (authorization) forwardHeaders.authorization = authorization;

    const response = await servicesAxiosInstance.delete(
      `${BASE_URL}/users/${uuid}/documents/${document_uuid}`,
      {
        headers: forwardHeaders,
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.response?.data?.error ?? "Failed to delete document" },
      { status: error?.response?.status ?? 500 }
    );
  }
}
