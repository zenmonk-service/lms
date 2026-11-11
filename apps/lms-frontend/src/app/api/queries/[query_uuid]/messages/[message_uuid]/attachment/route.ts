import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ query_uuid: string; message_uuid: string }> },
) {
  try {
    const { query_uuid, message_uuid } = await context.params;
    const response = await backendClient.delete(
      `/queries/${query_uuid}/messages/${message_uuid}/attachment`,
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
