import { backendClient } from "@/config/server";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  context: { params: { uuid: string } } | { params: Promise<{ uuid: string }> },
) {
  try {
    const params = await context.params;
    const { uuid } = params;
    const body = await request.json();

    const response = await backendClient.put(
      `/leave-types/${uuid}`,
      body,
    );

    return backendClient.toNextResponse(response);
  } catch (err: any) {
    return backendClient.errorResponse({
      data: err?.response?.data,
      status: err?.response?.status,
    });
  }
}
