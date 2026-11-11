import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ query_uuid: string }> },
) {
  try {
    const { query_uuid } = await context.params;
    const { searchParams } = new URL(request.url);
    const response = await backendClient.get(`/queries/${query_uuid}/messages`, {
      params: Object.fromEntries(searchParams),
    });

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

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ query_uuid: string }> },
) {
  try {
    const { query_uuid } = await context.params;
    const body = await request.json();
    const response = await backendClient.post(
      `/queries/${query_uuid}/messages`,
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
