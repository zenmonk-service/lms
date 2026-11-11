import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ query_uuid: string }> },
) {
  try {
    const { query_uuid } = await context.params;
    const response = await backendClient.get(`/queries/${query_uuid}`);

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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ query_uuid: string }> },
) {
  try {
    const { query_uuid } = await context.params;
    const body = await request.json();
    const response = await backendClient.put(`/queries/${query_uuid}`, body);

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
  request: NextRequest,
  context: { params: Promise<{ query_uuid: string }> },
) {
  try {
    const { query_uuid } = await context.params;
    const response = await backendClient.delete(`/queries/${query_uuid}`);

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
