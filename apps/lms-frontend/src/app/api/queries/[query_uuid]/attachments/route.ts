import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ query_uuid: string }> },
) {
  try {
    const { query_uuid } = await context.params;
    const formData = await request.formData();
    const response = await backendClient.post(
      `/queries/${query_uuid}/attachments`,
      formData,
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
