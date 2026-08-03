import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  const { uuid } = await context.params;

  try {
    const { searchParams } = new URL(request.url);
    const response = await backendClient.get(`/users/${uuid}/notifications`, {
      params: Object.fromEntries(searchParams),
    });

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
