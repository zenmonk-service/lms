import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ query_uuid: string; message_uuid: string }> },
) {
  try {
    const { query_uuid, message_uuid } = await context.params;
    const body = await request.json();
    const response = await backendClient.patch(
      `/queries/${query_uuid}/messages/${message_uuid}`,
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

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ query_uuid: string; message_uuid: string }> },
) {
  try {
    const { query_uuid, message_uuid } = await context.params;
    const response = await backendClient.delete(
      `/queries/${query_uuid}/messages/${message_uuid}`,
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
