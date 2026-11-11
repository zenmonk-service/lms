import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ query_uuid: string }> },
) {
  try {
    const { query_uuid } = await context.params;
    const body = await request.json();
    const response = await backendClient.patch(
      `/queries/${query_uuid}/status`,
      body,
    );

    return backendClient.toNextResponse(response);
  } catch (err: unknown) {
    const error = err as {
      response?: { data?: unknown; status?: number };
    };

    return backendClient.errorResponse({
      data: error?.response?.data,
      status: error?.response?.status ?? 500,
    });
  }
}
