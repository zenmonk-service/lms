import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ query_uuid: string; member_uuid: string }> },
) {
  try {
    const { query_uuid, member_uuid } = await context.params;
    const response = await backendClient.delete(
      `/queries/${query_uuid}/members/${member_uuid}`,
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
